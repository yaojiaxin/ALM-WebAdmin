<template>
  <div class="mf-scrollbar-horizontal">
    <div
      ref="scrollbar"
      :style="{ width: width + '%',top: scrolling +'%' }"
      :class="'scrollbar' + (dragging || draggingFromParent ? '':' mf-scrollbar-transition')"
      @mousedown="startDrag"
      @touchstart="startDrag"
    />
  </div>
</template>

<script>
export default {
  props: {
    draggingFromParent: Boolean,
    scrolling: Number,
    wrapperWidth: Number,
    areaWidth: Number,
    onChangePosition: Function,
    onDragging: Function,
    onStopDrag: Function
  },

  data() {
    return {
      width: 0,

      dragging: false,

      start: 0

    }
  },

  watch: {
    'wrapperWidth'(val, old) {
      this.calculateSize(this)
    },

    'areaWidth'(val, old) {
      this.calculateSize(this)
    }
  },

  mounted() {
    this.calculateSize(this)

    document.addEventListener('mousemove', this.onDrag)
    document.addEventListener('mouseup', this.stopDrag)
  },
  beforeDestroy() {
    document.removeEventListener('mousemove', this.onDrag)
    document.removeEventListener('mouseup', this.stopDrag)
  },
  methods: {
    startDrag(e) {
      e.preventDefault()
      e.stopPropagation()

      e = e.changedTouches ? e.changedTouches[0] : e

      this.start = e.clientX
      this.dragging = true
    },

    onDrag(e) {
      if (this.dragging) {
        this.onDragging()

        e.preventDefault()
        e.stopPropagation()

        e = e.changedTouches ? e.changedTouches[0] : e

        const xMovement = e.clientX - this.start
        const xMovementPercent = xMovement / this.wrapperWidth * 100

        this.start = e.clientX

        const nextX = this.scrolling + xMovementPercent

        this.onChangePosition(nextX)
      }
    },

    stopDrag(e) {
      if (this.dragging) {
        this.onStopDrag()
        this.dragging = false
      }
    },

    calculateSize(source) {
      this.width = (source.wrapperWidth / source.areaWidth) * 100
    }
  }
}
</script>

<style>
.mf-scrollbar-horizontal {
    height: 5px;
    width: 100%;
    position: absolute;
    background: rgba(0, 0, 0,.1);
    bottom: 0;
    left: 0;
    border-radius: 5px;
    transition: all 0.5s ease;
    -moz-transition: all 0.5s ease;
    -webkit-transition: all 0.5s ease;
    -o-transition: all 0.5s ease;
}

.scrollbar{
    height: 5px;
    position: absolute;
    width: 10px;
    background: rgba(0, 0, 0,.1);
    border-radius: 5px;
}
.scrollbar:hover{
    background: rgba(0, 0, 0,.3);
}
</style>
