import { debounce, uniqBy } from '@mashcard/active-support'
import { devWarning } from '@mashcard/design-system'
import { UnsplashImage } from '@mashcard/uploader'
import { Node } from '@tiptap/core'
import { ChangeEvent, RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { EmbedOptions } from '../../../../../extensions'

const UNSPLASH_PER_PAGE = 20

export function useUnsplashImages(
  loadMoreRef: RefObject<HTMLDivElement>,
  extension: Node<EmbedOptions>
): [UnsplashImage[], boolean, (event: ChangeEvent<HTMLInputElement>) => void] {
  const [unsplashImages, setUnsplashImages] = useState<UnsplashImage[]>([])
  const [fetching, setFetching] = useState(false)

  const lastQuery = useRef('')
  const page = useRef(1)

  const fetchUnsplashImage = useCallback(
    async (query?: string): Promise<void> => {
      if (!extension.options.getGalleryImages) return
      if (fetching) return

      if (query && query !== lastQuery.current) {
        page.current = 1
        lastQuery.current = query
      }

      setFetching(true)

      try {
        const response = await extension.options.getGalleryImages({
          query: lastQuery.current,
          page: page.current,
          perPage: UNSPLASH_PER_PAGE
        })

        if (response.success) {
          setUnsplashImages(prevData => uniqBy([...(page.current === 1 ? [] : prevData), ...response.data], 'id'))
          page.current += 1
        }
      } catch (error) {
        devWarning(true, error)
      }

      setFetching(false)
    },
    [extension.options, fetching]
  )

  const observeY = useRef<number>()

  useEffect(() => {
    const ele = loadMoreRef.current
    if (!ele) return

    void fetchUnsplashImage()

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 1.0
    }

    const observer = new IntersectionObserver((entities): void => {
      const y = entities[0].boundingClientRect.y
      if (observeY.current! > y) {
        void fetchUnsplashImage()
      }
      observeY.current = y
    }, options)

    observer.observe(ele)

    return () => observer.unobserve(ele)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleUnsplashSearch = useCallback(
    debounce((event: ChangeEvent<HTMLInputElement>): void => {
      const query = event.target.value
      setUnsplashImages([])
      void fetchUnsplashImage(query)
    }, 300),
    []
  )

  return [unsplashImages, fetching, handleUnsplashSearch]
}
