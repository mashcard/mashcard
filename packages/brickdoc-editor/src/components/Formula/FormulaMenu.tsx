import React from 'react'
import { Button, Input, Popover } from '@brickdoc/design-system'
import { VariableData } from '@brickdoc/formula'
import { useEditorI18n } from '../../hooks'
import './FormulaMenu.less'
import { EditorContentType, FormulaEditor } from '../../extensions/formula/FormulaEditor/FormulaEditor'
import { FormulaResult } from './FormulaResult'
import { AutocompleteList } from './AutocompleteList/AutocompleteList'
import { CompletionType } from './useFormula'
import { BrickdocEventBus, FormulaCalculateTrigger } from '@brickdoc/schema'
import { JSONContent } from '@tiptap/core'

export interface FormulaMenuProps {
  formulaId: string
  rootId: string
  defaultVisible: boolean
  onVisibleChange: (visible: boolean) => void
  variableT?: VariableData
  handleDelete: (variable?: VariableData) => void
  nameRef: React.MutableRefObject<string | undefined>
  defaultName: string
  updateEditor: (content: JSONContent, position: number) => void
  editorContent: EditorContentType
  isDisableSave: () => boolean
  doHandleSave: () => Promise<void>
  handleSelectActiveCompletion: () => void
  completion: CompletionType
  setCompletion: React.Dispatch<React.SetStateAction<CompletionType>>
}

const i18nKey = 'formula.menu'

export const FormulaMenu: React.FC<FormulaMenuProps> = ({
  children,
  formulaId,
  rootId,
  handleDelete,
  editorContent,
  defaultVisible,
  onVisibleChange,
  isDisableSave,
  doHandleSave,
  variableT,
  defaultName,
  nameRef,
  updateEditor,
  handleSelectActiveCompletion,
  completion,
  setCompletion
}) => {
  const { t } = useEditorI18n()
  const [visible, setVisible] = React.useState(defaultVisible)
  const [inputName, setInputName] = React.useState(nameRef.current)

  const close = (): void => {
    setVisible(false)
    onVisibleChange?.(false)
  }

  const triggerCalculate = (): void => {
    BrickdocEventBus.dispatch(
      FormulaCalculateTrigger({
        formulaId,
        rootId
      })
    )
  }

  const onPopoverVisibleChange = (visible: boolean): void => {
    if (!visible) {
      close()
      return
    }
    triggerCalculate()
    onVisibleChange?.(visible)
    setVisible(visible)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const name = e.target.value
    nameRef.current = name
    setInputName(name)
    triggerCalculate()
  }

  const handleSave = async (): Promise<void> => {
    if (isDisableSave()) return
    await doHandleSave()
    close()
  }

  const handleCancel = (): void => {
    close()
  }

  const menu = (
    <div className="brickdoc-formula-menu">
      <div className="formula-menu-header">{t(`${i18nKey}.header`)}</div>
      <div className="formula-menu-row">
        <div className="formula-menu-item">
          <label className="formula-menu-label">
            <span className="formula-menu-label-text">{t(`${i18nKey}.name`)}</span>
            <Input
              className="formula-menu-field"
              placeholder={defaultName}
              value={inputName ?? nameRef.current}
              onChange={handleNameChange}
            />
          </label>
        </div>
      </div>
      <div className="formula-menu-row">
        <span className="formula-menu-result-label">=</span>
        <div className="formula-menu-item">
          <FormulaEditor
            editorContent={editorContent}
            updateEditor={updateEditor}
            editable={true}
            formulaId={formulaId}
            rootId={rootId}
          />
        </div>
      </div>
      <div className="formula-menu-divider" />
      <FormulaResult variableT={variableT} />
      <AutocompleteList
        blockId={rootId}
        completion={completion}
        handleSelectActiveCompletion={handleSelectActiveCompletion}
        setCompletion={setCompletion}
      />
      <div className="formula-menu-footer">
        <Button className="formula-menu-button" size="sm" type="text" onClick={handleCancel}>
          {t(`${i18nKey}.cancel`)}
        </Button>
        <Button
          className="formula-menu-button"
          size="sm"
          type="primary"
          onClick={handleSave}
          disabled={isDisableSave()}
        >
          {t(`${i18nKey}.save`)}
        </Button>
        <Button
          className="formula-menu-button"
          size="sm"
          type="text"
          danger={true}
          onClick={() => handleDelete(variableT!)}
        >
          {t(`${i18nKey}.delete`)}
        </Button>
      </div>
    </div>
  )

  return (
    <Popover
      onVisibleChange={onPopoverVisibleChange}
      defaultVisible={defaultVisible}
      visible={visible}
      className="brickdoc-formula-menu-popover"
      destroyTooltipOnHide={true}
      content={menu}
      placement="bottom"
      trigger={['click']}
    >
      {children}
    </Popover>
  )
}
