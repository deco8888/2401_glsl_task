/** @type {import('stylelint').Config} */
const config = {
    extends: ['stylelint-config-recommended', 'stylelint-config-standard-scss', 'stylelint-config-recess-order'],
    // 同じルール内の別のプロパティ値により無視されるプロパティ値を禁止（ex: display: inlineを使用した場合、widthなどのsizeプロパティは無視される）
    plugins: ['stylelint-declaration-block-no-ignored-properties'],
    rules: {
        'at-rule-no-unknown': null, //scssで使える @includeなどにエラーがでないようにする
        'scss/at-rule-no-unknown': true, //scssでもサポートしていない @ルール にはエラーを出す
        'no-invalid-position-at-import-rule': true, // スタイルシート内の無効な位置の@import規則を許可しないよう設定
        'rule-empty-line-before': null, // ルールの前の空行を要求または禁止
        'property-no-vendor-prefix': null, // プロパティにベンダープレフィックスを許可しない
        'value-keyword-case': null, // キーワードの値には、小文字と大文字を指定
        'declaration-empty-line-before': 'never', // 宣言の前に空行を置くことを要求または禁止
        'function-url-quotes': 'never', // URLに引用符をつけるかつけないかを指定 / never:付けない
        'scss/operator-no-newline-after': null, // Sass演算子の後の改行を禁止するかどうか
        'color-hex-length': 'long', // 16 進法の色の短・長記法を指定
        'scss/dollar-variable-empty-line-before': null, // 変数宣言の前に空行を入れるか、空行を入れないかを指定
        'scss/double-slash-comment-empty-line-before': null,
        'selector-pseudo-class-no-unknown': [
            true,
            {
                ignorePseudoClasses: ['/^deep/'],
            },
        ],
    },
    ignoreFiles: ['**/node_modules/**'],
};
module.exports = config;
