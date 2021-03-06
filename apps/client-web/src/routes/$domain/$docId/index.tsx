import { MashcardContext } from '@/common/mashcardContext'
import { DocumentInfo, Policytype, useBlockCreateMutation, useDocumentBlockQuery } from '@/MashcardGraphQL'
import { isUUID } from '@mashcard/active-support'
import { appendFormulas, FormulaContext } from '@mashcard/formula'
import { BlockMetaUpdated, MashcardEventBus, ReloadDocument } from '@mashcard/schema'
import { FC, Suspense, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { AppError404 } from '../../_shared/AppError'
import { LayoutContext } from '../_shared/DocumentPageLayout'
import { DocumentEditor } from './_shared/DocumentEditor'
import { DocumentTopBar } from './_shared/DocumentTopBar'
import { queryPageBlocks } from '../_shared/graphql'
import { FormulaContextVar } from '../_shared/reactiveVars'
import { useDocsI18n } from '../_shared/useDocsI18n'
import { useFormulaActions } from '../_shared/useFormulaActions'
// TOD: fix these imports
import { formulaI18n } from '@mashcard/legacy-editor/src/helpers'
import { useFormulaI18n } from '@mashcard/legacy-editor/src/hooks/useFormulaI18n'
import { DocMeta } from '../_shared/DocMeta'

export const Index: FC = () => {
  const { t } = useDocsI18n()
  const { t: formulaT } = useFormulaI18n()
  const { domain, docId, historyId } = useParams() as unknown as {
    domain: string
    docId?: string
    historyId?: string
  }
  const { currentUser, lastDomain, lastBlockIds, featureFlags } = useContext(MashcardContext)
  const { setDocMeta, setErrorPage, setPageTitle, setSibebarVisible } = useContext(LayoutContext)
  const navigate = useNavigate()
  const [latestLoading, setLatestLoading] = useState(true)
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo>()

  const {
    data,
    refetch,
    loading: blockLoading
  } = useDocumentBlockQuery({
    variables: { id: docId as string, historyId },
    fetchPolicy: 'no-cache'
  })

  const [blockCreate, { loading: createBlockLoading }] = useBlockCreateMutation({
    refetchQueries: [queryPageBlocks]
  })
  const loading = !data || blockLoading || createBlockLoading

  useEffect(() => {
    if (!loading) setLatestLoading(false)
  }, [loading, setLatestLoading])

  // NOTE: temp fix title updating / reloading by turning DocumentInfo to state before we migrated to zustand
  useEffect(() => {
    if (data?.blockNew?.documentInfo) {
      setDocumentInfo(data.blockNew.documentInfo as DocumentInfo)
    }
    const subscriptions = [
      MashcardEventBus.subscribe(
        BlockMetaUpdated,
        ({ payload }) => {
          if (data?.blockNew?.documentInfo) {
            setDocumentInfo({
              ...(data.blockNew.documentInfo as DocumentInfo),
              title: payload.meta.title as string,
              icon: payload.meta.icon
            })
          }
        },
        { eventId: docId }
      ),
      MashcardEventBus.subscribe(
        ReloadDocument,
        ({ payload }) => {
          void refetch()
        },
        { eventId: docId }
      )
    ]
    const pathArray = data?.blockNew?.documentInfo?.pathArray
    if (pathArray) {
      pathArray.forEach(path => {
        subscriptions.push(
          MashcardEventBus.subscribe(
            BlockMetaUpdated,
            ({ payload }) => {
              void refetch()
            },
            { eventId: path.id }
          )
        )
      })
    }
    return () => {
      subscriptions.forEach(s => s.unsubscribe())
    }
  }, [data, setDocumentInfo, docId, refetch])

  const isAnonymous = !currentUser
  const { state } = useLocation()

  // TODO: refactor DocMeta, separate frontend state and model data
  const docMeta: DocMeta = useMemo(() => {
    const policy = documentInfo?.permission?.policy
    const isMine = !!documentInfo?.isMaster
    const isAlias = docId ? !isUUID(docId) : false
    const shareable = isMine
    const editable = (isMine || policy === Policytype.Edit) && !isAnonymous && !documentInfo?.isDeleted && !historyId
    const viewable = isMine || (!!policy && [Policytype.View, Policytype.Edit].includes(policy))
    const isDeleted = documentInfo?.isDeleted !== false
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const title: string = documentInfo?.title || t('title.untitled')
    const path = `/${domain}/${docId}`

    const id = isAlias ? documentInfo?.id : docId
    const alias = isAlias ? docId : documentInfo?.enabledAlias?.key
    const isRedirect = !!(state as any)?.redirect
    const isNotExist = !loading && !documentInfo?.id

    return {
      id,
      alias,
      isAlias,
      domain,
      title,
      isDeleted,
      path,
      isAnonymous,
      isMine,
      isRedirect,
      shareable,
      editable,
      viewable,
      isNotExist,
      historyId,
      documentInfo
    }
  }, [documentInfo, docId, historyId, isAnonymous, loading, state, t, domain])

  const { queryFormulas, commitFormula, generateFormulaFunctionClauses } = useFormulaActions()

  useEffect(() => {
    const functionClauses = generateFormulaFunctionClauses()
    const formulaContext = FormulaContext.getFormulaInstance({
      username: domain,
      i18n: formulaI18n(formulaT),
      backendActions: { commit: commitFormula },
      functionClauses,
      features: featureFlags
    })
    void queryFormulas(domain).then(({ data, success }) => {
      if (!success) return
      void appendFormulas(formulaContext, data ?? [])
    })

    FormulaContextVar(formulaContext)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    async function createAndNavigateToNewPage(): Promise<void> {
      if (lastBlockIds && (lastBlockIds as any)[domain]) {
        navigate(`/${domain}/${(lastBlockIds as any)[domain]}`)
      } else {
        const { data: blockCreateData } = await blockCreate({ variables: { input: { title: '', username: domain } } })
        if (blockCreateData?.blockCreate?.id) {
          navigate(`/${domain}/${blockCreateData?.blockCreate?.id}`)
        }
      }
    }

    if (!docMeta.isAnonymous && !docId) {
      void createAndNavigateToNewPage()
    }

    // NOTE redirect if has its `alias` and current id is `uuid`
    if (!docMeta.isAlias && docMeta.alias) {
      navigate(`/${domain}/${docMeta.alias}`, { replace: true })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockCreate, docId, history, domain, docMeta, lastDomain, lastBlockIds])

  useEffect(() => {
    setDocMeta(docMeta)
    setPageTitle(docMeta.id && docMeta.title)
    setSibebarVisible(!isAnonymous)
    if (docMeta.isNotExist && !latestLoading) {
      setErrorPage(<AppError404 />)
    } else {
      setErrorPage(null)
    }
  }, [docMeta, domain, isAnonymous, latestLoading, setDocMeta, setErrorPage, setPageTitle, setSibebarVisible, t])

  if (docMeta.isNotExist && !latestLoading) {
    return <AppError404 btnCallback={() => navigate('/')} />
  }

  return (
    <>
      <header style={isAnonymous ? { paddingRight: 0 } : undefined}>
        <Suspense>
          <DocumentTopBar />
        </Suspense>
      </header>
      <section>
        <article id="article">
          <Suspense>
            <DocumentEditor data={data} loading={latestLoading} editable={docMeta.editable} />
          </Suspense>
        </article>
        {!isAnonymous && <aside id="aside" />}
      </section>
    </>
  )
}

// eslint-disable-next-line import/no-default-export
export default Index
