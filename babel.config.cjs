module.exports = {
  presets: [
    "@babel/preset-env",
    "@babel/preset-react",
  ],
  plugins: [
    "@babel/plugin-transform-modules-commonjs"
  ],
  targets: {
    esmodules: true
  }
}
