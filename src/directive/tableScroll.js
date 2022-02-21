const tableScroll = {
  bind(el, binding) {
    let scrollTop = 0
    const dom = el.querySelector('.ant-table-body')
    let oldScrollTop = 0
    const userAgent = navigator.userAgent
    const isChrome = userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Safari') > -1
    dom.addEventListener('scroll', e => {
      if (navigator.userAgent.indexOf('Window') > 0 && isChrome) {
        if (oldScrollTop - dom.scrollTop > 200) {
          dom.scrollTop = oldScrollTop
        } else {
          oldScrollTop = dom.scrollTop
        }
      }

      const isBottom = (dom.clientHeight + dom.scrollTop) >= (dom.scrollHeight - 5)
      const isHorizontal = scrollTop === dom.scrollTop

      if (isBottom && !isHorizontal && dom.scrollTop !== 0) {
        if (binding.value) {
          binding.value()
        }
      }
      if (!isHorizontal) {
        scrollTop = dom.scrollTop
      }
    })
  }
}

export default {
  key: 'tableScroll',
  func: tableScroll

}

