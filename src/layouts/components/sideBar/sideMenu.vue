<template>
  <a-layout-sider
    v-model="iscollapsed"
    :trigger="null"
    collapsible
    :width="240"
    :collapsed-width="56"
    style="background-color: #fff"
  >
    <!-- <mf-scroll class="mf-sidemenu" :style="{ height: isShowBottomMenu ? 'calc( 100vh - 164px )' : '100%' }"> -->
    <div class="mf-sidemenu" :style="{ height: '100%' }">
      <a-menu mode="inline" :selected-keys="[$route.path]" @click="handleClick">
        <template v-for="items in sideMenuRoute.filter((i) => !i.hidden)">
          <a-sub-menu v-if="items.nest" :id="items.path" :key="items.path">
            <span slot="title">
              <!-- <a-icon :type="items.meta.icon" /> -->
              <i class="anticon">
                <i class="icon iconfont " :class="items.meta.icon" />
              </i>
              <span>{{ items.meta.title }}</span>
            </span>

            <!--    has child menu show        -->
            <a-menu-item class="menu-item-arrow" disabled />

            <!--    has child menu show        -->
            <a-menu-item v-if="iscollapsed" :key="items.meta.title" disabled class="menu-child-title" @click="onClickTitle">
              {{ items.meta.title }}
            </a-menu-item>

            <a-menu-item
              v-for="route in items.children.filter((i) => !i.hidden)"
              :id="items.path + '/' + route.path"
              :key="route.path"
              class="menu-child-name"
            >
              {{ route.meta.title }}
            </a-menu-item>
          </a-sub-menu>
          <template v-else-if="!items.nest && items.root">
            <a-menu-item
              v-for="child in items.children"
              :id="child.path"
              :key="child.path"
            >
              <!-- <a-icon :type="child.meta.icon" /> -->
              <i class="anticon">
                <i
                  class="icon iconfont"
                  :class="child.meta.icon"
                />
              </i>
              <span :class="iscollapsed&&'menu-item-color'">{{ child.meta.title }}</span>
            </a-menu-item>
          </template>
          <template v-else>
            <a-menu-item :id="items.path" :key="items.path">
              <i class="anticon">
                <i class="icon iconfont" :class="items.meta.icon" />
              </i>
              <!-- <a-icon :type="items.children[0].meta.icon" /> -->
              <span :class="iscollapsed&&'menu-item-color'">{{ items.meta.title }}</span>
            </a-menu-item>
          </template>
        </template>
      </a-menu>
    </div>
    <!-- </mf-scroll> -->
    <!-- <div class="mf-sidemenu-bottom-wrapper">
      <ul class="mf-sidemenu-bottom">
        <li v-if="isShowSiteMenu">
          <a-tooltip v-if="iscollapsed" placement="right">
            <template slot="title">
              {{ $t('siteAdministration') }}
            </template>
            <a target="_blank" href="/qcbin/SiteAdmin.jsp" class="collapsed-link"><i class="iconfont icon-link" /></a>
          </a-tooltip>

          <template v-else>
            <i class="iconfont icon-link" />
            <a target="_blank" class="btm-title" href="/qcbin/SiteAdmin.jsp">{{ $t('siteAdministration') }}</a>
          </template>
        </li>

        <li v-if="isShowSassMenu">
          <a-tooltip v-if="iscollapsed" placement="right">
            <template slot="title">
              {{ $t('saasInformation') }}
            </template>
            <a class="collapsed-link" target="_blank" href="/qcbin/qcaddon/msm/api/SaaSInformation.jsp"><i class="iconfont icon-link" /></a>
          </a-tooltip>
          <template v-else>
            <i class="iconfont icon-link" />
            <a class="btm-title" target="_blank" href="/qcbin/qcaddon/msm/api/SaaSInformation.jsp">{{ $t('saasInformation') }}</a>
          </template>
        </li>

      </ul>
    </div> -->
    <!-- <li><i class="iconfont icon-link" /><a href="#">Terms & Conditions</a></li> -->

    <span class="mf-btn-toggle" @click="toggleCollapsed">
      <i class="mf-btn-toggle-arrow" />
    </span>
  </a-layout-sider>
</template>

<script>
// import MfScroll from '@/components/MFScroll'
import { mapGetters } from 'vuex'

export default {
  // components: { MfScroll },
  props: {
    iscollapsed: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters(['permission_routes', 'serverType']),
    sideMenuRoute() {
      const temMenusRoutes =
        this.permission_routes.filter(
          (i) => i.children && i.children.length >= 1
        ) || []
      return temMenusRoutes
    }
  },
  methods: {
    handleClick(e) {
      this.$router.push(e.key)
    },

    toggleCollapsed() {
      this.$emit('update:iscollapsed', !this.iscollapsed)
      this.$store.commit('changeCollapsed/SET_COLLAPSED', !this.iscollapsed)
    },

    onClickTitle() {
      return false
    }
  }
}
</script>

<style lang="less" scoped>
.mf-sidemenu{
  height: calc( 100vh - 164px );
  overflow-y: auto;
  overflow-x: hidden;
}
.mf-sidemenu-bottom-wrapper{
  height: 108px;
  border-top: 2px solid #F1F2F3;
}
.mf-sidemenu-bottom{
  list-style: none;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;

  li{
    line-height: 36px;
    display: block;
    height: 36px;
    padding: 0 24px;

    &:hover{
      background-color: rgba(0, 121, 239, 0.05);

      i,a{
        color: #0073E7;
      }
    }

    i{
      margin-right: 16px;
      color: rgba(101, 102, 104, 1);
    }

    a{
      font-size: 18px;
      color: rgba(101, 102, 104, 1);
      text-decoration:underline;
    }
  }

  .collapsed-link{
    text-decoration: none;
  }
}

.menu-child-title{
  width: 100%;
  height: 40px!important;
  line-height: 40px!important;
  color: rgba(0,0,0,.5);
}
.menu-child-name{
  height: 32px!important;
  line-height: 32px!important;
  padding-left: 30px!important;
}
.menu-item-color{
  color: rgba(0, 0, 0, 0.5) !important;
}

.menu-item-arrow{
  position: absolute !important;
  top: 10px !important;
  left: -37px !important;
  width: 0!important;
  height: 0!important;
  border-top: 5px solid transparent !important;
  border-bottom: 5px solid transparent !important;
  border-right: 5px solid #fff !important;
}

.ant-layout-sider-collapsed .mf-sidemenu-bottom{
  li{
    padding: 0 20px;
  }
  .btm-title{
    display: none;
  }
}
</style>
