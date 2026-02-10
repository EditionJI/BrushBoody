module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 39, // 设计稿宽度为390px，所以rootValue设为39
      propList: ['*'], // 需要转换的属性，*表示所有属性
      selectorBlackList: ['.no-rem', 'html'], // 不转换的选择器
      exclude: /node_modules/i, // 排除node_modules
      unitPrecision: 5, // 转换后保留的小数位数
      replace: true, // 是否替换原有值
      mediaQuery: false, // 是否转换媒体查询中的px
      minPixelValue: 1, // 转换的最小px值，小于1px不转换
    }
  }
}
