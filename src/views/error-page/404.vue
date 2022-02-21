<template>
  <div class="mf-err-page">
    <div class="mf-err-img">
      <img alt src="../../assets/404.png">
    </div>
    <p class="mf-err-404">404</p>
    <p class="mf-err-words">{{ $t('404') }}</p>
    <a-button
      class="back-btn"
      type="primary"
      @click="() => $router.push('/customers')"
    >
      {{ $t('BackHome') }}
    </a-button>
  </div>
</template>

<script>

export default {
}
</script>

<style lang="less" scoped>
.mf-err-page{
  padding-top: 5%;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  font-size: 20px;
  .mf-err-img {
    position: relative;
    width: 35%;
    img{
      width: 100%;
    }
  }
  .mf-err-404 {
    width: 34%;
    margin: -155px 0 0 0;
    font-size: 500%;
    font-weight: 600;
    text-align: center;
    color: #0079EF;
    z-index: 99;
  }
  .mf-err-words{
    margin: 0;
    text-align: center;
    line-height: 35px;
    font-size: 150%;
    color: #0079EF;
  }
  .back-btn{
    margin-top: 36px;
    line-height: 32px;
    padding: 0 10px;
  }
}
</style>
