import { useContext, FC, useState } from 'react'
import { Avatar, Button, styled, Popover, toast } from '@brickdoc/design-system'
import { Edit } from '@brickdoc/design-icons'
import { SettingsContext } from '@/settings/SettingContext'
import { usePrepareFileUpload } from '@/docs/pages/hooks'
import { Dashboard, ImportSourceOption, UploadResultData } from '@brickdoc/uploader'
import { PodOperation, useCreateOrUpdatePodMutation } from '@/BrickdocGraphQL'
import { useSettingsI18n } from '@/settings/common/hooks'

const Wrapper = styled(Popover, {
  margin: '.5rem 0',
  cursor: 'pointer',
  position: 'relative'
})

const IMPORT_SOURCES: ImportSourceOption[] = [
  {
    // TODO: open file dialog directly
    type: 'upload',
    typeLabel: 'Local File',
    buttonText: 'Upload a photo...',
    acceptType: 'image/*'
  }
]

export const AvatarEditor: FC = () => {
  const { pod } = useContext(SettingsContext)!
  const prepareFileUpload = usePrepareFileUpload()
  const [updatePod] = useCreateOrUpdatePodMutation()
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(pod?.avatarData?.url)
  const { t } = useSettingsI18n()
  const onUploaded = async (attrs: UploadResultData): Promise<void> => {
    const result = await updatePod({
      variables: {
        input: {
          type: PodOperation.Update,
          webid: pod!.webid,
          avatarSignedId: attrs.signedId
        }
      }
    })
    const errors = result.data?.createOrUpdatePod?.errors
    if (errors && errors?.length > 0) {
      toast.error(errors.join('\n'))
    } else {
      setAvatarUrl(attrs.viewUrl)
      toast.success(t('general.avatar_updated'))
    }
  }

  return (
    <Wrapper
      aria-haspopup="menu"
      destroyTooltipOnHide={true}
      content={
        <Dashboard
          fileType="image"
          prepareFileUpload={prepareFileUpload}
          onUploaded={onUploaded}
          importSources={IMPORT_SOURCES}
        />
      }
    >
      <Avatar role="button" initials={pod?.name ?? pod?.webid} src={avatarUrl} size={100} />
      <Button
        icon={<Edit />}
        circle={true}
        size="lg"
        css={{
          position: 'absolute',
          bottom: '0',
          right: '0'
        }}
      />
    </Wrapper>
  )
}