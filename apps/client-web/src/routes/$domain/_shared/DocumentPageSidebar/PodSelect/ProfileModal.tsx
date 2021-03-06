import { useDomainAvailableValidator } from '@/common/hooks'
import { CreateOrUpdatePodInput, PodOperation, useCreateOrUpdatePodMutation } from '@/MashcardGraphQL'
import { Button, Form, Input, Modal, toast } from '@mashcard/design-system'
import React from 'react'
import { object, string } from 'yup'
import { useDocsI18n } from '../../useDocsI18n'

interface ProfileModalProps {
  visible: boolean
  title: string
  type: PodOperation
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const DialogCss = {
  width: 480,
  padding: '54px 80px',
  '&>h1.dialogTitle': {
    marginBottom: '3rem'
  },
  label: {
    display: 'none'
  }
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ visible, title, type, setVisible }) => {
  const { t } = useDocsI18n()
  const [confirmLoading, setConfirmLoading] = React.useState(false)
  const domainAvailableValidator = useDomainAvailableValidator()

  const form = Form.useForm<CreateOrUpdatePodInput>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    yup: object({
      name: string().required(t('pods.required.name')).test(domainAvailableValidator)
    })
  })
  const [createOrUpdatePod] = useCreateOrUpdatePodMutation()

  const handleCancel = (): void => {
    setVisible(false)
    setConfirmLoading(false)
    form.reset()
  }

  const handleOk = async (values: CreateOrUpdatePodInput): Promise<void> => {
    setConfirmLoading(true)
    const input: CreateOrUpdatePodInput = {
      type,
      domain: values.name!,
      name: values.name
    }
    await createOrUpdatePod({ variables: { input } })
    form.reset()
    void toast.success(t('pods.create.success'))
    setConfirmLoading(false)
    setVisible(false)
    globalThis.location.href = `/${values.name}`
  }

  return (
    <Modal open={visible} onClose={handleCancel} title={title} dialogCss={{ ...DialogCss }}>
      <Form
        form={form}
        layout="vertical"
        onSubmit={handleOk}
        onError={() => {
          // onError
          setConfirmLoading(false)
        }}
      >
        <Form.Field name="name">
          {/* eslint-disable-next-line */}
          <Input borderType="underline" autoFocus placeholder={t('pods.pod_input_placeholder')} />
        </Form.Field>
        <Form.Field inlineWrapper>
          <Button onClick={handleCancel} size="lg" block>
            Cancel
          </Button>
          <Button loading={confirmLoading} type="primary" htmlType="submit" size="lg" block>
            Create
          </Button>
        </Form.Field>
      </Form>
    </Modal>
  )
}
