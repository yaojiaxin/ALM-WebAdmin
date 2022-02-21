<style>
.mf-scroll-wrapper {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.mf-scrollbar-transition,
.mf-scrollbar-vertical,
.mf-scrollbar-horizontal {
  transition: all 0.5s ease;
  -moz-transition: all 0.5s ease;
  -webkit-transition: all 0.5s ease;
  -o-transition: all 0.5s ease;
}

.mf-loading-data {
  top: -50px;
  height: 50px;
  width: 100%;
}

.mf-loading-data .el-loading-mask {
  background: transparent;
}
</style>

<template>
  <div ref="scrollWapper" :class="'mf-scroll-wrapper' + ( classes ? ' ' + classes:'' )">

    <div
      ref="scrollArea"
      :class="'mf-scrollbar-area' + ( dragging ? ' ' : ' mf-scrollbar-transition' )"
      :style="{ marginTop: position.y * -1 + 'px', marginLeft: position.x * -1 +'px'}"
      @wheel="scroll"
    >

      <slot />
      <div v-if="false" v-loading="loading" class="mf-loading-data" />

      <scrollbar-vertical
        v-if="vertical"
        :wrapper-height="wapperHeight"
        :scrolling="Movement"
        :area-height="areaHeight"
        :on-dragging="handleScrollbarDragging"
        :on-change-position="handleChangePosition"
        :on-stop-drag="handleStopDrag"
      />

      <!-- <scrollbar-horizontal
        v-if="vertical"
        :wrapper-height="wapperWidth"
        :scrolling="Movement"
        :area-height="areaWidth"
        :on-dragging="handleScrollbarDragging"
        :on-change-position="handleChangePosition"
        :on-stop-drag="handleStopDrag"
      /> -->
    </div>
  </div>
</template>

<script>
import ScrollbarVertical from './ScrollVertical.vue'
// import ScrollbarHorizontal from './ScrollHorizontal'

export default {
  components: { ScrollbarVertical },
  props: {
    classes: String,

    loadData: Function
  },
  data() {
    return {
      // 容器高度
      wapperHeight: 0,

      // 容器宽度
      wapperWidth: 0,

      // 内容高度
      areaHeight: 0,

      areaWidth: 0,

      // 垂直滚动条显示
      vertical: false,

      // 水平滚动条显示
      horizontal: false,

      position: { y: 0, x: 0 },

      Movement: 0,

      hMovement: 0,

      dragging: false,

      loading: false
    }
  },

  computed: {
    height: function() {
      if (this.$refs.scrollArea.children.length > 0) {
        return this.$refs.scrollArea.children[0].clientHeight
      } else {
        return 0
      }
    }
  },
  mounted() {
    var vm = this

    var time = setInterval(function() {
      if (vm.$refs.scrollArea && vm.$refs.scrollArea.children[0]) {
        vm.calculateSize()
        window.clearInterval(time)
      } else {
        window.clearInterval(time)
      }
    }, 1000)

    window.addEventListener('resize', vm.calculateSize)
  },

  beforeDestroy() {
    // Remove Event
    window.removeEventListener('resize', this.calculateSize)
  },
  methods: {
    scroll(e) {
      e.preventDefault()
      e.stopPropagation()

      const scrollY = e.deltaY > 0 ? 120 : -120
      const nextY = this.position.y + scrollY
      const canScrollY = this.areaHeight > this.wapperHeight

      if (canScrollY) this.normalizeVertical(nextY)
    },

    // 计算尺寸
    calculateSize() {
      if (this.$refs.scrollArea.children && this.$refs.scrollArea.children.length > 0) {
        this.areaHeight = this.$refs.scrollArea.children[0].clientHeight
        this.areaWidth = this.$refs.scrollArea.children[0].clientWidth
      }

      this.wapperHeight = this.$refs.scrollWapper.clientHeight
      this.wapperWidth = this.$refs.scrollWapper.clientWidth

      this.vertical = this.areaHeight > this.wapperHeight
      this.horizontal = this.areaWidth > this.wapperWidth

      if (this.vertical) {
        this.normalizeVertical(this.position.y)
        // this.position.y = 0
      } else {
        this.position.y = 0
      }

      if (this.horizontal) {
        this.normalizeHorizontal(this.position.x)
        this.position.x = 0
      } else {
        this.position.x = 0
      }
    },

    normalizeVertical(nextY) {
      const lowerEnd = this.areaHeight - this.wapperHeight

      // 加载到底部
      if (nextY > lowerEnd) {
        nextY = lowerEnd

        this.loadingData()
      } else if (nextY <= 0) {
        nextY = 0
      }

      this.position.y = nextY
      this.Movement = nextY / this.areaHeight * 100
    },

    normalizeHorizontal(nextX) {
      const lowerEnd = this.areaWidth = this.wapperWidth

      if (nextX > lowerEnd) {
        nextX = lowerEnd
      } else if (nextX <= 0) {
        nextX = 0
      }

      this.position.x = nextX
      this.hMovement = nextX / this.areaWidth * 100
    },

    handleScrollbarDragging() {
      this.dragging = true
    },

    handleChangePosition(movement) {
      const nextY = movement / 100
      // const nextX = movement / 100

      this.normalizeVertical(nextY * this.areaHeight)
      // this.normalizeHorizontal(nextX * this.areaWidth)
    },

    handleStopDrag() {
      this.dragging = false
    },

    loadingData() {
      var vm = this

      if (typeof this.loadData === 'function') {
        this.loading = true
        this.dragging = false

        new Promise((resolve, reject) => {
          vm.loadData()
          resolve()
        }).then(() => {
          vm.calculateSize()
          this.loading = false
          this.dragging = true
        })
      }
    }
  }
}
</script>
