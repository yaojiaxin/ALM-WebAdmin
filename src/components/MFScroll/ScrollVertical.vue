<style>
.mf-scrollbar-vertical {
    width: 5px;
    height: 100%;
    position: absolute;
    background: rgba(0, 0, 0,.1);
    top: 0;
    right: 0;
    border-radius: 5px;
    transition: all 0.5s ease;
    -moz-transition: all 0.5s ease;
    -webkit-transition: all 0.5s ease;
    -o-transition: all 0.5s ease;
    z-index: 9;
}

.scrollbar{
    width: 5px;
    position: absolute;
    height: 5px;
    background: rgba(0, 0, 0,.1);
    border-radius: 5px;
}
.scrollbar:hover{
    background: rgba(0, 0, 0,.3);
}
</style>

<template>
  <div class="mf-scrollbar-vertical">
    <div
      ref="scrollbar"
      :style="{ height: height + '%',top: scrolling +'%' }"
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
    wrapperHeight: Number,
    areaHeight: Number,
    onChangePosition: Function,
    onDragging: Function,
    onStopDrag: Function
  },
  data() {
    return {
      height: 0,

      dragging: false,

      start: 0
    }
  },
  watch: {
    'wrapperHeight'(val, old) {
      this.calculateSize(this)
    },

    'areaHeight'(val, old) {
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

      this.start = e.clientY
      this.dragging = true
    },

    onDrag(e) {
      if (this.dragging) {
        this.onDragging()

        e.preventDefault()
        e.stopPropagation()

        e = e.changedTouches ? e.changedTouches[0] : e

        const yMovement = e.clientY - this.start
        const yMovementPercent = yMovement / this.wrapperHeight * 100

        this.start = e.clientY

        const nextY = this.scrolling + yMovementPercent

        this.onChangePosition(nextY)
      }
    },

    stopDrag(e) {
      if (this.dragging) {
        this.onStopDrag()
        this.dragging = false
      }
    },

    calculateSize(source) {
      this.height = (source.wrapperHeight / source.areaHeight) * 100
    }
  }
}
</script>
