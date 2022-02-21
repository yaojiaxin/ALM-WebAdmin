import { mount } from '@vue/test-utils'
import SvgIcon from '@/components/SvgIcon/index.vue'
describe('SvgIcon.vue', () => {
  it('iconClass', () => {
    const wrapper = mount(SvgIcon, {
      propsData: {
        iconClass: 'test'
      }
    })
    expect(wrapper.find('use').attributes().href).toBe('#icon-test')
  })
  it('className', async () => {
    const wrapper = mount(SvgIcon, {
      propsData: {
        iconClass: 'test'
      }
    })
    expect(wrapper.classes().length).toBe(1)
    await wrapper.setProps({ className: 'test' })
    expect(wrapper.classes('test')).toBe(true)
  })
})
