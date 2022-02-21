import Vue from 'vue'

import {
  ConfigProvider,
  Layout,
  Input,
  Button,
  Select,
  Form,
  FormModel,
  Row,
  Col,
  Modal,
  Table,
  Tabs,
  Icon,
  Dropdown,
  Breadcrumb,
  Menu,
  Drawer,
  Tooltip,
  Divider,
  DatePicker,
  Checkbox,
  Radio,
  // message,
  TreeSelect,
  Transfer,
  Tree,
  Upload,
  Collapse,
  Switch,
  Spin,
  Popover,
  InputNumber,
  Steps,
  Tag,
  Badge,
  Empty,
  Pagination,
  Progress,
  Slider
} from 'ant-design-vue'
import MFForm from '@/components/MFForm'
import MFModal from '@/components/MFModal'
import MFDrawer from '@/components/MFDrawer'
import MFDatePicker from '@/components/MFDatePicker'
import MFTable from '@/components/MFTable/index'
import MFSelect from '@/components/MFSelect'
import MFTransfer from '@/components/MFTransfer'
import MFHelpBtn from '@/components/BtnIcon/HelpBtn'
import ModalConfirm from '@/components/ModalConfirm/index'
import MfConfirm from '@/components/MFConfirm'
import MfMessage from '@/components/MFMessage'

Vue.component('mf-date-picker', MFDatePicker)
Vue.component('mf-table', MFTable)
Vue.component('mf-select', MFSelect)
Vue.component('mf-help-btn', MFHelpBtn)
Vue.component('mf-help-btn', MFHelpBtn)
// Vue.component('mf-confirm', ModalConfirm)
Vue.component('mf-modal-confirm', ModalConfirm)
Vue.component('message', MfMessage)

Vue.use(ConfigProvider)
Vue.use(Layout)
Vue.use(Input)
Vue.use(Button)
Vue.use(Select)
Vue.use(Form)
Vue.use(FormModel)
Vue.use(Row)
Vue.use(Col)
Vue.use(Modal)
Vue.use(Table)
Vue.use(Tabs)
Vue.use(Icon)
Vue.use(Dropdown)
Vue.use(Breadcrumb)
Vue.use(Menu)
Vue.use(Drawer)
Vue.use(Tooltip)
Vue.use(Divider)
Vue.use(DatePicker)
Vue.use(Checkbox)
Vue.use(Radio)
Vue.use(TreeSelect)
Vue.use(Transfer)
Vue.use(Tree)
Vue.use(Upload)
Vue.use(Collapse)
Vue.use(Switch)
Vue.use(Spin)
Vue.use(Popover)
Vue.use(InputNumber)
Vue.use(Steps)
Vue.use(Tag)
Vue.use(Badge)
Vue.use(Empty)
Vue.use(Pagination)
Vue.use(Progress)
Vue.use(Slider)

Vue.use(MFForm)
Vue.use(MFModal)
Vue.use(MFDrawer)
Vue.use(MFTransfer)
Vue.use(Badge)

// Vue.use(MFTable)

Vue.prototype.$message = MfMessage
Vue.prototype.$mfConfirm = MfConfirm

MfMessage.config({
  duration: 5,
  maxCount: 1
})

