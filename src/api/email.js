import request from '@/utils/request'

export function sendEmails(data) {
  return request({
    url: '/v2/sa/api/mails',
    method: 'post',
    data
  })
}

export function sendTestEmails(data) {
  return request({
    url: '/v2/sa/api/mails/send-test-mail',
    method: 'post',
    data
  })
}
