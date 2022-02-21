/**
 * loading decorator
 */
export const decoratorLoading = function() {
  return function(target, name, descriptor) {
    const fn = descriptor.value

    descriptor.value = async function(...rest) {
      try {
        return await fn.call(this, ...rest)
      // eslint-disable-next-line no-empty
      } catch (error) {

      }
    }
  }
}
