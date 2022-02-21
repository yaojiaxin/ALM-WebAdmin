function isProjectCanBeOperated(status) {
  return (status === 'Active' || status === 'Inactive')
}

export default isProjectCanBeOperated
