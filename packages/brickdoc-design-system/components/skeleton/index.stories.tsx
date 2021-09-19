import React from 'react'
import { Story } from '@storybook/react'
import { Skeleton, SkeletonProps, Space } from '../'
export default {
  title: 'ReactComponents/Skeleton',
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component: `
Provide a placeholder while you wait for content to load, or to visualise content that doesn't exist yet.

## When To Use

- When a resource needs long time to load.
- When the component contains lots of information, such as List or Card.
- Only works when loading data for the first time.
- Could be replaced by Spin in any situation, but can provide a better user experience.

## API

### Skeleton

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| active | Show animation effect | boolean | false |
| avatar | Show avatar placeholder | boolean \\| [SkeletonAvatarProps](#SkeletonAvatarProps) | false |
| loading | Display the skeleton when true | boolean | - |
| paragraph | Show paragraph placeholder | boolean \\| [SkeletonParagraphProps](#SkeletonParagraphProps) | true |
| round | Show paragraph and title radius when true | boolean | false |
| title | Show title placeholder | boolean \\| [SkeletonTitleProps](#SkeletonTitleProps) | true |

### SkeletonAvatarProps

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| active | Show animation effect, only valid when used avatar independently | boolean | false |
| shape | Set the shape of avatar | \`circle\` \\| \`square\` | - |
| size | Set the size of avatar | number \\| \`large\` \\| \`small\` \\| \`default\` | - |

### SkeletonTitleProps

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| width | Set the width of title | number \\| string | - |

### SkeletonParagraphProps

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| rows | Set the row count of paragraph | number | - |
| width | Set the width of paragraph. When width is an Array, it can set the width of each row. Otherwise only set the last row width | number \\| string \\| Array&lt;number \\| string> | - |

### SkeletonButtonProps

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| active | Show animation effect | boolean | false |
| block | Option to fit button width to its parent width | boolean | false |
| shape | Set the shape of button | \`circle\` \\| \`round\` \\| \`default\` | - |
| size | Set the size of button | \`large\` \\| \`small\` \\| \`default\` | - |

### SkeletonInputProps

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| active | Show animation effect | boolean | false |
| size | Set the size of input | \`large\` \\| \`small\` \\| \`default\` | - |
`
      }
    }
  }
}

const Template: Story<SkeletonProps> = _args => (
  <>
    <Skeleton avatar paragraph={{ rows: 4 }} />
    <br />
    <br />
    <Skeleton active />
    <br />
    <br />
    <Skeleton loading={true}>
      <div>
        <h4>《知行录》</h4>
        <p>
          先生游南镇，一友指岩中花树问曰：「天下无心外之物，如此花树，在深山中自开自落，于我心亦何相关？」
          先生曰：「你未看此花时，此花与汝心同归于寂。你来看此花时，则此花颜色一时明白起来。便知此花不在你的心外。」
        </p>
      </div>
    </Skeleton>
    <br />
    <br />
    <Space>
      <Skeleton.Button />
      <Skeleton.Button />
      <Skeleton.Avatar />
      <Skeleton.Input style={{ width: 200 }} />
    </Space>
  </>
)
export const Base = Template.bind({})
