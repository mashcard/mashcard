import { Button } from './index'
import { Add, ArrowRight, Delete } from '@mashcard/design-icons'
import { ComponentMeta, ComponentStory } from '@storybook/react'

export default {
  title: 'Components/Button',
  component: Button,
  args: {
    type: 'secondary',
    size: 'md',
    block: false,
    disabled: false,
    circle: false,
    htmlType: 'button',
    iconPosition: 'start'
  },
  argTypes: {
    type: {
      options: ['primary', 'secondary', 'danger', 'text'],
      control: {
        type: 'radio'
      }
    },
    size: {
      options: ['sm', 'md', 'lg'],
      control: {
        type: 'radio'
      }
    },
    block: {
      control: 'boolean'
    },
    disabled: {
      control: 'boolean'
    },
    circle: {
      control: 'boolean'
    },
    loading: {
      control: 'boolean',
      description: '`boolean | { delay?: number }`'
    },
    htmlType: {
      options: ['button', 'submit', 'reset'],
      control: {
        type: 'radio'
      }
    },
    iconPosition: {
      options: ['start', 'end'],
      control: {
        type: 'radio'
      }
    },
    icon: {
      description: '`React.ReactNode`'
    },
    onClick: {
      description: '`(e: PressEvent) => void`'
    },
    role: {
      description: '`React.AriaRole`'
    },
    className: {
      description: '`string`'
    },
    style: {
      description: '`React.CSSProperties`'
    }
  },
  parameters: {
    docs: {
      description: {
        component: `
To trigger an operation.

#### When To Use

A button means an operation (or a series of operations). Clicking a button will trigger corresponding business logic.
`
      }
    },
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/YcVOEbdec2oqyKrYFSkeYW/Components-Base?node-id=24%3A25'
    }
  }
} as ComponentMeta<typeof Button>

const Template: ComponentStory<typeof Button> = args => {
  const { css, ...otherArgs } = args
  return <Button {...otherArgs} />
}

export const Basic = Template.bind({})
Basic.args = {
  type: 'primary',
  children: '42 is the meaning of life',
  onClick: () => {
    console.log('click')
  }
}

export const WithStartIcon = Template.bind({})
WithStartIcon.args = {
  type: 'danger',
  children: (
    <span>
      Confirm to <strong>delete</strong>
    </span>
  ),
  icon: <Delete />
}

export const WithEndIcon = Template.bind({})
WithEndIcon.args = {
  type: 'primary',
  children: 'Get started',
  icon: <ArrowRight />,
  iconPosition: 'end'
}

export const IconOnly = Template.bind({})
IconOnly.args = { icon: <Add />, 'aria-label': 'Add Record', circle: true, size: 'lg' }

export const Loading = Template.bind({})
Loading.args = { loading: true, children: 'Loading...' }

export const LoadingAfter5Seconds = Template.bind({})
LoadingAfter5Seconds.args = { loading: { delay: 5000 }, children: 'Loading after 5 seconds...' }
