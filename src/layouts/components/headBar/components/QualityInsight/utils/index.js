export const ScrollingLoadSettings = {
  FETCH_COUNT: 100,
  SEARCH_INTERVAL: 1000
}

const SELECT_ITEM_HEIGHT = 31
const triggerFetchHeight =
  SELECT_ITEM_HEIGHT * (ScrollingLoadSettings.FETCH_COUNT / 2)

export function useSelectScroll(event, fn) {
  const { scrollHeight, scrollTop, clientHeight } = event.target
  if (scrollHeight - scrollTop - clientHeight < triggerFetchHeight) {
    fn()
  }
}

export function throttle(fn, delay) {
  let _this, args, timer
  return function() {
    _this = this
    args = arguments

    if (!timer) {
      timer = setTimeout(() => {
        timer = null
        fn.apply(_this, args)
      }, delay)
    }
  }
}
