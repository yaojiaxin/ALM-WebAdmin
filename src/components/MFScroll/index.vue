<template>
  <div
    ref="scrollContainer"
    class="scroll-container"
    @wheel.prevent="handleScroll"
  >
    <div ref="scrollWrap" class="scroll-wrapper" :style="{top: top + 'px'}">
      <slot />
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      top: 0
    }
  },

  methods: {

    handleScroll(e) {
      const eventDelta = e.wheelDelta || -e.deltaY * 3
      const $container = this.$refs.scrollContainer
      const $containerHeight = $container.offsetHeight
      const $wrapper = this.$refs.scrollWrap
      const $wrapperHeight = $wrapper.offsetHeight

      if (eventDelta > 0) {
        this.top = Math.min(0, this.top + eventDelta)
      } else if ($containerHeight < $wrapperHeight) {
        if (this.top < -($wrapperHeight - $containerHeight)) {
          // eslint-disable-next-line no-self-assign
          this.top = this.top
        } else {
          this.top = Math.max(this.top + eventDelta, $containerHeight - $wrapperHeight)
        }
      } else {
        this.top = 0
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .scroll-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .scroll-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    transition: all 0.5s ease;
  }
</style>
