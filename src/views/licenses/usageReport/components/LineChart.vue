<template>
  <div id="line-chart" class="line-chart">
    <div class="btn-group">
      <icon-btn
        id="a-icon-Storage"
        :icon-title="isTotal?$t('licenses.unShowTotal'):$t('licenses.ShowTotal')"
        :icon-style="isTotal?'icon-licensesUnshow':'icon-licensesShow'"
        tooltip-style-class="tooltip-style"
        @onClick="showTotal"
      />
      <!--      :icon-title="isTotal?$t('licenses.unShowTotal'):$t('licenses.ShowTotal')"-->

      <icon-btn
        id="a-icon-Circle"
        :icon-title="$t('licenses.circle')"
        icon-style="icon-Circle"
        @onClick="onRotate"
      />

      <!--      <a-input-number-->
      <!--        v-model="percent"-->
      <!--        class="input"-->
      <!--        :default-value="100"-->
      <!--        :min="40"-->
      <!--        :max="100"-->
      <!--        :formatter="value => `${value}%`"-->
      <!--        :parser="value => value.replace('%', '')"-->
      <!--        @change="onChange"-->
      <!--      />-->

    </div>
    <div id="charts" ref="charts" class="charts">
      <!--      <span class="mf-subtitle dot" />-->
      <div
        id="main"
        ref="main"
        class="main"
        :style="{width: widthPx, height: heightPx}"
      />
      <!--      :style="{width: widthPx, height: heightPx}"-->

    </div>
    <div id="img-cont" style="display: none">
      <img id="img" src="" alt="">
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'
import IconBtn from '@/components/BtnIcon/index'
import { mapGetters } from 'vuex'
import { SERVER_TYPE } from '@/store/const'

export default {
  components: {
    IconBtn
  },
  props: {
    usageArr: {
      default: () => [],
      type: Array
    },
    lastTime: {
      default: 'Last Week',
      type: String
    },
    license: {
      default: () => [],
      type: Array
    },
    isShowFilter: {
      default: false,
      type: Boolean
    },
    heightNum: {
      default: 320,
      type: Number
    }
  },
  data() {
    return {
      rate: 1,
      myChart: {},
      // GetWindowInfo: {
      //   height: 0,
      //   width: 0,
      //   widthPx: '',
      //   heightPx: ''
      // },
      // percent: 100,
      rotate: 90,
      xData: [],
      option: {},
      isTotal: false,
      legendData: [],
      series: [],
      interval: 0,
      heightPx: this.heightNum + 'px',
      widthPx: '600px'
    }
  },
  computed: {
    ...mapGetters(['serverType'])
  },
  watch: {
    isShowFilter: function(val) {
      const chart = document.getElementById('line-chart')
      const height = chart.clientHeight - 80 - (this.serverType === SERVER_TYPE.OnPremise ? 20 : 0) - (val ? 57 : 0)
      this.heightPx = height < this.heightNum ? this.heightNum : height + 'px'
    }
  },
  created() {
    // this.getWindowInfo()
    // window.addEventListener('resize', this.getWindowInfo)

    this.$nextTick(() => {
      this.drawCharts()
    })
  },
  mounted() {
    this.$nextTick(() => {
      this.getAllLicenses()
      this.getWindowInfo()
      const that = this
      window.addEventListener('resize', that.debounce(that.listenResize, 300))
    })
  },
  updated() {
    this.drawCharts()
  },

  destroyed() {
    const that = this
    window.removeEventListener('resize', that.debounce)
  },
  methods: {
    debounce(operate, delay) {
      let time = null
      let timer = null
      let newTime = null
      function task() {
        newTime = +new Date()
        if (newTime - time < delay) {
          timer = setTimeout(task, delay)
        } else {
          operate()
          timer = null
        }
        time = newTime
      }
      return function() {
        time = +new Date()
        if (!timer) {
          timer = setTimeout(task, delay)
        }
      }
    },
    listenResize() {
      return (() => {
        const chart = document.getElementById('line-chart')
        if (!chart) return
        this.widthPx = chart.clientWidth - 90 < 600 ? 600 : chart.clientWidth - 90 + 'px'
        const height = chart.clientHeight - 80 - (this.serverType === SERVER_TYPE.OnPremise ? 20 : 0) - (this.isShowFilter ? 57 : 0)
        this.heightPx = height < this.heightNum ? this.heightNum : height + 'px'
      })()
    },
    getWindowInfo() {
      const chart = document.getElementById('line-chart')
      this.widthPx = chart.clientWidth - 90 < 600 ? 600 : chart.clientWidth - 90 + 'px'
      const height = chart.clientHeight - 80 - (this.serverType === SERVER_TYPE.OnPremise ? 20 : 0) - (this.isShowFilter ? 57 : 0)
      this.heightPx = height < this.heightNum ? this.heightNum : height + 'px'
    },
    drawCharts() {
      this.myChart = echarts.init(this.$refs.main)
      const option = {
        // backgroundColor: '#ffffff',
        title: {
          text: this.$t('licenses.LicenseUsage'),
          textStyle: {
            fontSize: 14
          }
        },
        backgroundColor: '#fff',
        dataZoom: [
          {
            show: true,
            realtime: true,
            start: 0,
            end: 100,
            xAxisIndex: [0]
          },
          {
            type: 'inside',
            realtime: true,
            start: 0,
            end: 100,
            xAxisIndex: [0]
          }
        ],

        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          data: this.legendData,
          left: 'right',
          orient: 'vertical', // 'horizontal'  'vertical'
          padding: [10, 0, 0, 0],
          itemGap: 20
        },

        grid: {
          left: '60',
          right: '190',
          bottom: '10%',
          containLabel: true,
          top: 50,
          x: 45,
          x2: 30,
          y2: 80
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: this.xData,
            axisLabel: {
              interval: this.interval,
              // interval: 'auto',
              showMaxLabel: true,
              showMinLabel: true,
              rotate: this.rotate // rotate 0 and 90
            }
          }
        ],

        yAxis: [
          {
            type: 'value',
            minInterval: 1,
            max: function(value) {
              return value.max + 1
            }
          }
        ],
        color: ['#271782', '#014272', '#0b8eac', '#00a989', '#5bba36', '#ffb000', '#9b1e83', '#5216ac', '#0053ac', '#b21646'],
        series: this.series
      }
      this.option = option
      this.myChart.setOption(this.option)

      this.myChart.resize()
    },
    // onChange(value) {
    //   this.rate = value / 100
    //   this.GetWindowInfo.widthPx = this.rate * this.GetWindowInfo.width + 'px'
    //   this.GetWindowInfo.heightPx = this.rate * this.GetWindowInfo.height + 'px'
    //   this.drawCharts()
    // },
    // get all kinds of licenses
    textWrap(text) {
      let str = ''
      const maxNum = 25
      const arr = text.split(' ')
      let tmp = ''
      arr.forEach(item => {
        if (item.length >= maxNum) {
          str = str + item + '\n'
        } else {
          if (tmp.length + item.length < maxNum) {
            tmp = tmp + item + ' '
          } else {
            str = str + tmp + '\n'
            tmp = item + ' '
          }
        }
      })
      str = str + tmp
      return str
    },
    getAllLicenses() {
      this.legendData = this.license.map(item => {
        return this.textWrap(item.name)
      })
      this.series = this.license.map(item => {
        return {
          name: this.textWrap(item.name),
          id: item.id,
          type: 'line',
          // stack: this.$t('Total'),
          smooth: true,
          // label: {
          //   show: true,
          //   position: 'top'
          // },
          // areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          data: []
        }
      })
      this.getLicenseUsage()
      this.drawCharts()
    },

    getLicenseUsage() {
      // get xData
      this.xData = this.usageArr.map(item => {
        return item.date
      })

      this.xData = [...new Set(this.xData)]
      this.usageArr.forEach(item => {
        if (item['license-usage']) {
          item['license-usage'] = Array.isArray(item['license-usage']) ? item['license-usage'] : [item['license-usage']]
          item['license-usage'].forEach(i => {
            const index = this.series.findIndex(value => value.id === i['license-id'])
            if (this.series[index] !== undefined) {
              this.series[index].data.push(i.peak)
            }
          })
        } else {
          this.series.forEach(item => {
            item.data.push(0)
          })
        }
      })
      // show total

      if (this.isTotal) {
        let totalList = []
        this.usageArr.forEach(item => {
          totalList.push(item['license-usage'] ? item['license-usage'].reduce((prev, curr) => {
            return prev.peak === undefined ? prev + curr.peak : prev.peak + curr.peak
          }) : 0)
        })

        // Determine if totalList is an array
        Array.isArray(totalList) ? totalList = [...totalList] : totalList = [totalList]

        const peak = {
          name: this.$t('Total'),
          type: 'line',
          // stack: this.$t('Total'),
          smooth: true,
          // label: {
          //   show: true,
          //   position: 'top'
          // },
          // areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          data: totalList
        }
        this.series.push(peak)
        this.legendData.push(this.$t('Total'))
        this.myChart.clear()
        this.myChart.setOption(this.option)
      }

      this.drawCharts()
    },

    // rotate xAxis
    onRotate() {
      this.rotate ? this.rotate = 0 : this.rotate = 90
      this.drawCharts()
    },
    showTotal() {
      this.isTotal = !this.isTotal
      let totalList = []
      this.usageArr.forEach(item => {
        totalList.push(item['license-usage'] ? item['license-usage'].reduce((prev, curr) => {
          return (prev.peak === undefined ? prev : prev.peak) + curr.peak
        }) : 0)
      })
      Array.isArray(totalList) ? totalList = [...totalList] : totalList = [totalList]

      const peak = {
        name: this.$t('Total'),
        type: 'line',
        // stack: this.$t('Total'),
        smooth: true,
        // label: {
        //   show: true,
        //   position: 'top'
        // },
        // areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: totalList
      }
      this.isTotal ? this.series.push(peak) : this.series.pop()
      this.isTotal ? this.legendData.push(this.$t('Total')) : this.legendData.pop()
      this.myChart.clear()
      this.myChart.setOption(this.option)
    },

    // how to show image
    transformImage(num) {
      let value = null
      const myCanvas = window.document.getElementsByTagName('canvas')[0]
      const element = document.getElementById('img-cont')
      const image = document.getElementById('img')
      image.src = myCanvas.toDataURL('image/png')

      // choose 1 to show src of image , choose 2 to show image element
      num === 1 ? value = image.src : value = element

      return value
    },

    // transform canvas to image/png and print
    printCharts() {
      const src = this.transformImage(2)
      this.$nextTick(() => {
        const bdHtml = src.innerHTML

        // open new window to help print
        const printHelper = window.open()
        printHelper.document.body.innerHTML = bdHtml
        printHelper.print()
        printHelper.close()
      })
    },
    // write blob in clipboard
    async copyCharts() {
      const src = this.transformImage(1)
      try {
        const data = await fetch(src)
        const blob = await data.blob()
        await navigator.clipboard.write([
          new window.ClipboardItem({
            [blob.type]: blob
          })
        ])
        this.$message.success(this.$t('licenses.ImageCopied'))
      } catch (e) {
        // console.log(e)
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .line-chart{
    display: flex;
    -webkit-display: flex;
    flex-direction: column;
    -webkit-flex-direction: column;
    align-items: center;
    background-color: #ffffff;
    padding-bottom: 20px;
    min-height: 470px !important;
    min-width: 700px !important;
    height: calc(100vh - 222px);
    width: calc(100vw - 285px);
  }
  .main-has-customer{
    .line-chart{
      min-height: 400px !important;

      height: calc(100vh - 267px);
    }
  }

  .btn-group{
    align-self: flex-end;
  }

  //.input{
  //  margin-right: 24px;
  //  background-color: #656668;
  //  color: #ffffff;
  //}

  .charts{
    display: flex;
  }

  .dot{
    align-self: flex-start;
    margin-top: 48px;
    margin-right: -6px;
  }

  .main{
    margin-top: 10px;
  }

</style>
