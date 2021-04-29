import { useRouter } from 'next/router'
import { useContext } from 'react'

import { CustomTypesContext } from "src/models/customTypes/context"

import { useModelReducer } from 'src/models/customType/modelReducer'
import { CustomTypeState } from '../../lib/models/ui/CustomTypeState'
import CustomTypeStore from 'src/models/customType/store'
import { CustomType } from 'lib/models/common/CustomType'
import { TabsAsObject } from 'lib/models/common/CustomType/tab'
import CustomTypeBuilder from 'lib/builders/CustomTypeBuilder'

const Ct = ({ Model, store }: { Model: CustomTypeState, store: CustomTypeStore }) => {
  return (
    <CustomTypeBuilder Model={Model} store={store} />
  )
}

const WithProvider = ({ customType }: { customType: CustomType<TabsAsObject> }) => {
  const [Model, store] = useModelReducer({ customType })
  return (<Ct Model={Model} store={store} />)
}

const WithRouter = () => {
  const router = useRouter()
  const { customTypes } = useContext(CustomTypesContext)

  const customType = customTypes.find((e) => e && e.id === router.query.ct)
  if (!customType) {
    router.replace('/cts')
    return null
  }
  return <WithProvider customType={customType} />
}

export default WithRouter