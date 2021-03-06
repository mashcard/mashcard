import { composeStories } from '@storybook/testing-react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { a11yTest, toStoryTable } from '../../../utilities/testing'

import * as AlertStories from '../alert.stories'

jest.mock('../../../hooks/useId')
const storyTable = toStoryTable(composeStories(AlertStories))

describe('Alert', () => {
  it.each(storyTable)('$name should pass the a11y test', async ({ story }) => {
    await a11yTest(story)
  })

  it.each(storyTable)('$name should match the snapshot', ({ Component }) => {
    const { container } = render(<Component />)
    expect(container).toMatchSnapshot()
  })

  describe('Dismiss button', () => {
    it('should invoke the callback when invoked', async () => {
      const onClose = jest.fn()
      render(<AlertStories.Basic onClose={onClose} />)
      const button = screen.getByRole('button', { name: 'Dismiss Button' })
      await userEvent.click(button)
      expect(onClose).toBeCalledTimes(1)
    })
    it('does nothing if the callback is not provided', async () => {
      render(<AlertStories.Basic />)
      const button = screen.getByRole('button', { name: 'Dismiss Button' })
      await expect(userEvent.click(button)).resolves.toBeUndefined()
    })
  })
})
