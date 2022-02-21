
<template>
  <div id="app">
    <a-config-provider :locale="locale">
      <router-view />
    </a-config-provider>
  </div>
</template>

<script>
import { antdLang } from '@/locales/messages'

export default {
  data() {
    return {
      locale: antdLang
    }
  },
  methods: {

  }
}
</script>

<style lang="less">
#app {
  font-family: RegularWeb, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-width: 1024px;
  overflow: hidden;
}
</style>
