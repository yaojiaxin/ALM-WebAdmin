import Mock from 'mockjs'

export default [
  {
    url: '/user/test/mock',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: Mock.mock({
          'data|1-3': [
            {
              'id|+1': 1,
              text: /title\d{1,3}/,
              value: '提交的值'
            }]
        })
      }
    }
  }
]
