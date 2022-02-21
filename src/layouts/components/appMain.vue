<template>
  <section class="app-main">
    <!-- <transition name="fade-transform" mode="out-in">
      <router-view />
    </transition> -->
    <!-- <router-view :key="key" /> -->
    <router-view v-if="isRouterAlive" />
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import { eventListener } from '@/views/project/event'
// let oldPath = ''

export default {
  name: 'AppMain',
  data() {
    return {
      isRouterAlive: true
    }
  },
  computed: {
    ...mapGetters(['isChangeRouterKey'])
  },
  // watch: {
  //   isChangeRouterKey(val) {
  //     if (this.isChangeRouterKey && oldPath === this.$route.path) {
  //       this.$store.commit('SET_ISCHANGECUSTOMER', false)
  //       this.reload()
  //     }
  //   }
  // },
  created() {
    const _this = this
    eventListener.on('changeView', function(val) {
      _this.reload()
    })
  },
  mounted() {
    // oldPath = this.$route.path
  },
  destroyed() {
    // oldPath = ''
  },
  methods: {
    reload() {
      this.isRouterAlive = false
      this.$nextTick(function() {
        this.isRouterAlive = true
      })
    }
  }
}
</script>

<style lang="less" scoped>
.app-main {
  min-height: calc(100vh - 56px);
  width: 100%;
  position: relative;
  overflow: hidden;
  background: #F5F7F8;
  padding: 24px;
  display: flex;
}
</style>
