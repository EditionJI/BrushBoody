interface ApiResponse<T, R = undefined> {
  code: number
  msg: string
  data?: T
  rows?: R
  total?: R extends undefined ? undefined : number
}
