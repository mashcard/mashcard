import { FC, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { debounce } from '@brickdoc/active-support'
import { Icon, Input, Popover, styled, theme } from '@brickdoc/design-system'
import { UnsplashImage } from '@brickdoc/uploader'
import { TEST_ID_ENUM } from '@brickdoc/test-helper'
import { EmbedBlockPlaceholder } from '../Placeholder'
import { BlockContainer } from '../../BlockContainer'
import { EditorContext } from '../../../../context/EditorContext'
import { UpdateEmbedBlockAttributes } from '../EmbedView'
import { useExternalProps } from '../../../../hooks/useExternalProps'
import { EmbedViewProps } from '../../../../extensions/blocks/embed/meta'
import { usePopoverVisible } from './usePopoverVisible'

export interface GalleryTypeEmbedBlockProps {
  deleteNode: EmbedViewProps['deleteNode']
  getPos: EmbedViewProps['getPos']
  node: EmbedViewProps['node']
  updateEmbedBlockAttributes: UpdateEmbedBlockAttributes
}

const Gallery = styled('div', {
  maxHeight: '28.5rem',
  overflow: 'scroll',
  paddingBottom: '.625rem 1rem',
  width: '38.5rem'
})

const GalleryTitle = styled('div', {
  color: theme.colors.typeSecondary,
  fontSize: theme.fontSizes.subHeadline,
  fontWeight: 600,
  lineHeight: '1.375rem',
  marginBottom: '1.125rem'
})

const GalleryImage = styled('div', {
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  borderRadius: '2px',
  cursor: 'pointer',
  filter: 'drop-shadow(0px 2px 4px rgba(44, 91, 255, 0.02)) drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.04))',
  height: '6.5625rem',
  marginBottom: '.5rem',
  marginRight: '.5rem',
  position: 'relative',
  width: '8.75rem'
})

const GalleryImageList = styled('div', {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  paddingBottom: '.1rem',
  [`${GalleryImage}:nth-child(4n)`]: {
    marginRight: 0
  }
})

const SearchInput = styled(Input, {
  marginBottom: '1rem'
})

const GalleryImageInfo = styled('div', {
  background: theme.colors.backgroundOverlayPrimary,
  borderRadius: '2px',
  bottom: 0,
  left: 0,
  opacity: 0,
  position: 'absolute',
  right: 0,
  transition: 'opacity 100ms ease-in-out',
  top: 0,
  '&:hover': {
    opacity: 1
  }
})

const GalleryImageUsername = styled('span', {
  bottom: '.5rem',
  color: theme.colors.white,
  fontSize: '.75rem',
  left: '.5rem',
  lineHeight: '1rem',
  position: 'absolute',
  textShadow: '0px 2px 4px rgba(44, 91, 255, 0.02), 0px 4px 4px rgba(0, 0, 0, 0.04)'
})

const LoadMorePlaceholder = styled('div', {})

const UNSPLASH_PER_PAGE = 20

export const GalleryTypeEmbedBlock: FC<GalleryTypeEmbedBlockProps> = ({
  node,
  deleteNode,
  getPos,
  updateEmbedBlockAttributes
}) => {
  const { t } = useContext(EditorContext)
  const externalProps = useExternalProps()
  const [unsplashImages, setUnsplashImages] = useState<UnsplashImage[]>([])

  const [popoverVisible, handlePopoverVisibleChange] = usePopoverVisible(node.attrs.uuid)

  const fetching = useRef(false)
  const lastQuery = useRef('')
  const page = useRef(1)

  const fetchUnsplashImage = useCallback(
    async (query?: string): Promise<void> => {
      if (fetching.current) {
        return
      }

      if (query && query !== lastQuery.current) {
        page.current = 1
        lastQuery.current = query
      }

      fetching.current = true

      try {
        const response = await externalProps.fetchUnsplashImages(lastQuery.current, page.current, UNSPLASH_PER_PAGE)

        if (response.success) {
          const prevData = page.current === 1 ? [] : unsplashImages

          setUnsplashImages([...prevData, ...response.data])
          page.current += 1
        }
      } catch (error) {
        console.error(error)
      }

      fetching.current = false
    },
    [externalProps, unsplashImages]
  )

  useEffect(() => {
    void fetchUnsplashImage()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleUnsplashSearchChange = useCallback(
    debounce((event: any): void => {
      const query = event.target.value
      void fetchUnsplashImage(query)
    }, 300),
    []
  )

  const observeY = useRef<number>()

  const createScrollObserver = (ele: HTMLDivElement | null): void => {
    if (!ele) {
      return
    }

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 1.0
    }

    new IntersectionObserver((entities): void => {
      const y = entities[0].boundingClientRect.y
      if (observeY.current && observeY.current > y) {
        void fetchUnsplashImage()
      }
      observeY.current = y
    }, options).observe(ele)
  }

  const handleSelectImage = useCallback(
    (item: UnsplashImage) => () => {
      updateEmbedBlockAttributes({ key: item.fullUrl, source: 'EXTERNAL' }, 'image')
    },
    [updateEmbedBlockAttributes]
  )

  return (
    <BlockContainer node={node} actionOptions={['delete']} deleteNode={deleteNode} getPos={getPos}>
      <Popover
        trigger="click"
        visible={popoverVisible}
        onVisibleChange={handlePopoverVisibleChange}
        content={
          <Gallery>
            <GalleryTitle>{t('embed_block.types.gallery.title')}</GalleryTitle>
            <SearchInput
              placeholder={t('embed_block.types.gallery.search.placeholder')}
              onChange={handleUnsplashSearchChange}
            />
            <GalleryImageList>
              {unsplashImages.map(item => (
                <GalleryImage
                  role="img"
                  key={item.id}
                  css={{
                    backgroundImage: `url(${item.smallUrl})`
                  }}
                  onClick={handleSelectImage(item)}
                >
                  <GalleryImageInfo>
                    <GalleryImageUsername>{item.username}</GalleryImageUsername>
                  </GalleryImageInfo>
                </GalleryImage>
              ))}
            </GalleryImageList>
            <LoadMorePlaceholder ref={createScrollObserver} />
          </Gallery>
        }
      >
        <EmbedBlockPlaceholder
          data-testid={TEST_ID_ENUM.editor.embedBlock.addButton.id}
          icon={<Icon.Unsplash />}
          label={t('embed_block.types.gallery.label')}
          description={t('embed_block.types.gallery.description')}
        />
      </Popover>
    </BlockContainer>
  )
}