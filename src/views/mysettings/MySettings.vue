<template>
  <div class="mysetting">
    <div class="setting-header">
      <span class="header-txt">{{ $t('mysetting.mysetting') }}</span>
    </div>

    <div class="setting-cont">
      <user-properties />
    </div>
  </div>
</template>

<script>
import UserProperties from './components/UserProperties'
import { HELP_ON_THIS_PAGE } from '../../../config/help'

export default {
  components: { UserProperties },
  data() {
    return {

    }
  },
  created() {
    this.$store.commit('helpPath/SET_HELPLINK', HELP_ON_THIS_PAGE.mySetting)
  }
}
</script>

<style lang="less" scoped>
  .mysetting{
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .setting-header{
    display: flex;
    align-items: center;
    height: 57px;
    background: #FFFFFF;
    box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(101, 102, 104, 0.16);
  }

  .header-txt{
    font-size: 16px;
    font-family: MediumWeb, serif;
    font-weight: 500;
    color: #000000;
    line-height: 19px;
    margin-left: 24px;
  }
</style>
