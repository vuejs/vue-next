## [3.0.9](https://github.com/vuejs/vue-next/compare/v3.0.8...v3.0.9) (2021-03-27)


### Bug Fixes

* **compiler-core:** fix slot source location ([#3494](https://github.com/vuejs/vue-next/issues/3494)) ([e752bdd](https://github.com/vuejs/vue-next/commit/e752bddb33b8d150e9f071f15b91a39d326522a3))
* **runtime-core:** fix kebab-case prop required warning ([2121c32](https://github.com/vuejs/vue-next/commit/2121c32e228376c01de4335e2fcc645b7581cd4b)), closes [#3495](https://github.com/vuejs/vue-next/issues/3495) [#3363](https://github.com/vuejs/vue-next/issues/3363)
* **runtime-core:** remove dev-only props property from setup context for consistency ([#3492](https://github.com/vuejs/vue-next/issues/3492)) ([4549e65](https://github.com/vuejs/vue-next/commit/4549e65baea54bfd10116241a6a5eba91ec3f632))
* ensure backwards compat for pre-compiled sfc components ([37c1709](https://github.com/vuejs/vue-next/commit/37c17091fddb26d54e080d2867102d017f09171f)), closes [#3493](https://github.com/vuejs/vue-next/issues/3493)



## [3.0.8](https://github.com/vuejs/vue-next/compare/v3.0.7...v3.0.8) (2021-03-26)


### Bug Fixes

* **compiler:** properly bail stringfication for nested slot elements ([f74b16c](https://github.com/vuejs/vue-next/commit/f74b16ccfe42abddf6abfa6105900ad9b8124a96))
* **compiler-core:** allow unicode to appear in identifiers ([#3443](https://github.com/vuejs/vue-next/issues/3443)) ([ebedccc](https://github.com/vuejs/vue-next/commit/ebedcccdc04d8cda40f7a3b69354acfdda265c74)), closes [#3440](https://github.com/vuejs/vue-next/issues/3440)
* **compiler-core:** avoid generating useless createVNode helper ([#2938](https://github.com/vuejs/vue-next/issues/2938)) ([7715c49](https://github.com/vuejs/vue-next/commit/7715c49af92f5db0e4eef52d983850c08439d87c)), closes [#2739](https://github.com/vuejs/vue-next/issues/2739)
* **compiler-core:** detect v-if branch root with comment as dev fragment ([#2785](https://github.com/vuejs/vue-next/issues/2785)) ([4bf7ba1](https://github.com/vuejs/vue-next/commit/4bf7ba19bf6b1a6c242090d512c91e1bf8c7c8cc)), closes [#2780](https://github.com/vuejs/vue-next/issues/2780)
* **compiler-core:** fix the detection of forwarded slots with v-if or v-for ([#3353](https://github.com/vuejs/vue-next/issues/3353)) ([602b58e](https://github.com/vuejs/vue-next/commit/602b58ebd1923dd48669755d5f5b67c5478cc625)), closes [#3347](https://github.com/vuejs/vue-next/issues/3347)
* **compiler-core:** should not condense whitespace in RCDATA text mode ([#3482](https://github.com/vuejs/vue-next/issues/3482)) ([b4b8215](https://github.com/vuejs/vue-next/commit/b4b82159e2175d27f7d1f2641d262269f981fc86)), closes [#3479](https://github.com/vuejs/vue-next/issues/3479)
* **compiler-dom:** stringifyStatic should remove attribute bindings with `null` value ([#3477](https://github.com/vuejs/vue-next/issues/3477)) ([ca6aa01](https://github.com/vuejs/vue-next/commit/ca6aa01181dd15e2ab76d89538cf898221f927cd)), closes [#3475](https://github.com/vuejs/vue-next/issues/3475)
* **compiler-sfc:** scope Id should not be attached to [@keyframe](https://github.com/keyframe) breakpoint rules ([#3308](https://github.com/vuejs/vue-next/issues/3308)) ([6cb9475](https://github.com/vuejs/vue-next/commit/6cb94752b0354117669de94f81c5195ec8c7f40c)), closes [#3304](https://github.com/vuejs/vue-next/issues/3304)
* **compiler-sfc:** should not rewrite scope variable ([#3449](https://github.com/vuejs/vue-next/issues/3449)) ([bbc5fe6](https://github.com/vuejs/vue-next/commit/bbc5fe6a9716efe87fdb4c4ac51fcdc3bd541904)), closes [#3445](https://github.com/vuejs/vue-next/issues/3445)
* **compiler-ssr:** keep the order of imports expression for the fallback branch of SSR ([#3448](https://github.com/vuejs/vue-next/issues/3448)) ([49f4072](https://github.com/vuejs/vue-next/commit/49f4072c83c06a66e2b7a334d8dedabd1b433ca9)), closes [#3447](https://github.com/vuejs/vue-next/issues/3447)
* **component:** prioritize registered component over implicit self-reference via filename ([abd129d](https://github.com/vuejs/vue-next/commit/abd129d845951737c335a80a8af6cf7b0df2f74d)), closes [#2827](https://github.com/vuejs/vue-next/issues/2827)
* **hydration:** handle camel-case tag name when performing match assertion ([#3247](https://github.com/vuejs/vue-next/issues/3247)) ([9036f88](https://github.com/vuejs/vue-next/commit/9036f88d8304a3455265f1ecd86ec8f4a5ea4715)), closes [#3243](https://github.com/vuejs/vue-next/issues/3243)
* **KeepAlive:** adapt keepalive for ssr ([#3259](https://github.com/vuejs/vue-next/issues/3259)) ([e8e9b00](https://github.com/vuejs/vue-next/commit/e8e9b00f81ed42434afd92f84101e7a14d70a23c)), closes [#3255](https://github.com/vuejs/vue-next/issues/3255)
* **reactivity:** ensure computed can be wrapped by readonly ([41e02f0](https://github.com/vuejs/vue-next/commit/41e02f0fac069c93c94438741517e713f3c94215)), closes [#3376](https://github.com/vuejs/vue-next/issues/3376)
* **reactivity:** ensure that shallow and normal proxies are tracked seperately (close [#2843](https://github.com/vuejs/vue-next/issues/2843)) ([#2851](https://github.com/vuejs/vue-next/issues/2851)) ([22cc4a7](https://github.com/vuejs/vue-next/commit/22cc4a76592cfe336e75e2fa0c05232ae1f0f149))
* **reactivity:** fix shallow readonly behavior for collections ([#3003](https://github.com/vuejs/vue-next/issues/3003)) ([68de9f4](https://github.com/vuejs/vue-next/commit/68de9f408a2e61a5726a4a0d03b026cba451c5bd)), closes [#3007](https://github.com/vuejs/vue-next/issues/3007)
* **rumtime-core:** custom dom props should be cloned when cloning a hoisted DOM ([#3080](https://github.com/vuejs/vue-next/issues/3080)) ([5dbe834](https://github.com/vuejs/vue-next/commit/5dbe8348581dacd7a3594a9b0055ce350ce8e5bf)), closes [#3072](https://github.com/vuejs/vue-next/issues/3072)
* **runtime-core:** cache props default values to avoid unnecessary watcher trigger ([#3474](https://github.com/vuejs/vue-next/issues/3474)) ([44166b4](https://github.com/vuejs/vue-next/commit/44166b43d9be1062f79612880f71284049bcab0b)), closes [#3471](https://github.com/vuejs/vue-next/issues/3471)
* **runtime-core:** ensure only skip unflushed job ([#3406](https://github.com/vuejs/vue-next/issues/3406)) ([bf34e33](https://github.com/vuejs/vue-next/commit/bf34e33c909da89681b9c5004cdf04ab198ec5a7))
* **runtime-core:** fix async component ref handling ([#3191](https://github.com/vuejs/vue-next/issues/3191)) ([7562e72](https://github.com/vuejs/vue-next/commit/7562e72c2b58a5646bd4fbd9adea11eb884fe140)), closes [#3188](https://github.com/vuejs/vue-next/issues/3188)
* **runtime-core:** fix erraneous emits warnings w/ mixins ([60d777d](https://github.com/vuejs/vue-next/commit/60d777d228414515cc32526ad72a53ef070501be)), closes [#2651](https://github.com/vuejs/vue-next/issues/2651)
* **runtime-core:** fix warning for absent props ([#3363](https://github.com/vuejs/vue-next/issues/3363)) ([86ceef4](https://github.com/vuejs/vue-next/commit/86ceef43523bfbbb0a24731d3802ca6849cbefd6)), closes [#3362](https://github.com/vuejs/vue-next/issues/3362)
* **runtime-core:** handle error in async setup ([#2881](https://github.com/vuejs/vue-next/issues/2881)) ([d668d48](https://github.com/vuejs/vue-next/commit/d668d48e9e5211a49ee53361ea5b4d67ba16e0a3))
* **runtime-core:** handle error in async watchEffect ([#3129](https://github.com/vuejs/vue-next/issues/3129)) ([eb1fae6](https://github.com/vuejs/vue-next/commit/eb1fae63f926435fb0eef890663d24e09d4c79e1))
* **runtime-core:** should call chained mixins and extends ([#3040](https://github.com/vuejs/vue-next/issues/3040)) ([b58bb16](https://github.com/vuejs/vue-next/commit/b58bb169590297daf9df0433b413fab118f18486)), closes [#3038](https://github.com/vuejs/vue-next/issues/3038)
* **runtime-core:** should not cache property access during data() invocation ([#3299](https://github.com/vuejs/vue-next/issues/3299)) ([6e88156](https://github.com/vuejs/vue-next/commit/6e88156934a88c891fa1014c46c04a3fa1a5eaeb)), closes [#3297](https://github.com/vuejs/vue-next/issues/3297)
* **runtime-core:** should not track deps in pre flush watcher callbacks ([d5824b9](https://github.com/vuejs/vue-next/commit/d5824b97c570eb9e3d689b840f098e401e458d05)), closes [#2728](https://github.com/vuejs/vue-next/issues/2728)
* **runtime-core:** the select tag's multiple prop should be set before the children mounting ([#3202](https://github.com/vuejs/vue-next/issues/3202)) ([2451dd8](https://github.com/vuejs/vue-next/commit/2451dd8ae63cc0667a234f9896b1a4f241d4cb44)), closes [#3199](https://github.com/vuejs/vue-next/issues/3199)
* **runtime-dom:** support mounting app to svg container ([#2929](https://github.com/vuejs/vue-next/issues/2929)) ([8ffcde2](https://github.com/vuejs/vue-next/commit/8ffcde2836baa41d279d9cc079f139a2e31cf6be)), closes [#2926](https://github.com/vuejs/vue-next/issues/2926)
* **ssr:** ensure async setup error handling work with suspense during ssr ([2e71f07](https://github.com/vuejs/vue-next/commit/2e71f07bc1bab09ca6970b8992d05aeea9b5e9e4))
* **ssr:** fix memory leak when vnode component render throws error ([da944cb](https://github.com/vuejs/vue-next/commit/da944cb37987212d1b1a860b79f43a7c85814225)), closes [#3100](https://github.com/vuejs/vue-next/issues/3100)
* **ssr:** properly update currentRenderingInstance state during ssr ([8c3c14a](https://github.com/vuejs/vue-next/commit/8c3c14a0ff02bffbc37e1b069d4ff3c7e086a1d5)), closes [#2863](https://github.com/vuejs/vue-next/issues/2863)
* **ssr:** respect render function from extends/mixins in ssr ([#3006](https://github.com/vuejs/vue-next/issues/3006)) ([0a583d5](https://github.com/vuejs/vue-next/commit/0a583d5ca224d2cba878dc6b0fb8d468e658f1ef)), closes [#3004](https://github.com/vuejs/vue-next/issues/3004)
* **ssr:** watchEffect onInvalidate runner initialization ([#3323](https://github.com/vuejs/vue-next/issues/3323)) ([e4b5fcc](https://github.com/vuejs/vue-next/commit/e4b5fccd0c54a1109737ae75b3ca2bc603cb05b3)), closes [#3322](https://github.com/vuejs/vue-next/issues/3322)
* **ssr/hydration:** handle ending empty text node ([#3246](https://github.com/vuejs/vue-next/issues/3246)) ([420c8f4](https://github.com/vuejs/vue-next/commit/420c8f4580dddea9a724cfadc4cc2c272181c24d)), closes [#3245](https://github.com/vuejs/vue-next/issues/3245)
* **teleport:** targetAnchor should also be removed when unmounted ([#2870](https://github.com/vuejs/vue-next/issues/2870)) ([21d1288](https://github.com/vuejs/vue-next/commit/21d128813353fd5d5a5304f8fb885265f5163cd8))
* **Teleport:** component with multi roots should be removed when unmounted ([#3157](https://github.com/vuejs/vue-next/issues/3157)) ([7769513](https://github.com/vuejs/vue-next/commit/776951315d38fb93b75892bd60a69177b4480f67)), closes [#3156](https://github.com/vuejs/vue-next/issues/3156)
* **Teleport:** fallback to non-optimized mode when HRM performing updates ([#3311](https://github.com/vuejs/vue-next/issues/3311)) ([9cb21d0](https://github.com/vuejs/vue-next/commit/9cb21d088edd097b75a038f2c11d1c921406686f)), closes [#3302](https://github.com/vuejs/vue-next/issues/3302)
* **transition:** toggling branches with in-out mode should be transitioned correctly ([#3109](https://github.com/vuejs/vue-next/issues/3109)) ([67a0290](https://github.com/vuejs/vue-next/commit/67a0290c0aa5626dbc71b66b00e7ca7755e339cb)), closes [#3104](https://github.com/vuejs/vue-next/issues/3104)
* **types:** allow style to be an array in JSX ([#2947](https://github.com/vuejs/vue-next/issues/2947)) ([13c9d2c](https://github.com/vuejs/vue-next/commit/13c9d2ca82d60652ef19fe055ecbe0d05134007b))
* **types:** union function prop ([#3119](https://github.com/vuejs/vue-next/issues/3119)) ([3755e60](https://github.com/vuejs/vue-next/commit/3755e60c52adcd83e569f32c3d31d8854b4fdd8d)), closes [#3357](https://github.com/vuejs/vue-next/issues/3357)
* **types:** unwrap refs on public instance data ([#3319](https://github.com/vuejs/vue-next/issues/3319)) ([2b588cf](https://github.com/vuejs/vue-next/commit/2b588cf1bc03329576b8759c9072e3e551b739f1)), closes [#3315](https://github.com/vuejs/vue-next/issues/3315)
* **types/jsx:** llow tabindex to be a string ([#3476](https://github.com/vuejs/vue-next/issues/3476)) ([e4a5712](https://github.com/vuejs/vue-next/commit/e4a5712a33d10d3087f1c3cff0ecdf5569a84d94))
* add display name for suspense component ([#3312](https://github.com/vuejs/vue-next/issues/3312)) ([3b3a9a1](https://github.com/vuejs/vue-next/commit/3b3a9a1f5225fb734d16ffe2d596f457e9c47cec))


### Performance Improvements

* support only attaching slot scope ids when necessary ([02cbbb7](https://github.com/vuejs/vue-next/commit/02cbbb718ca226b087c42e6f132120931307c2a6))



## [3.0.7](https://github.com/vuejs/vue-next/compare/v3.0.6...v3.0.7) (2021-03-01)


### Bug Fixes

* **compiler-sfc:** handle more edge cases in default rewrite ([1dedc19](https://github.com/vuejs/vue-next/commit/1dedc19e1f0a2039d2ab8f55af6e27034b8dcde5))
* **deps:** pin Rollup to 2.38 ([34f354b](https://github.com/vuejs/vue-next/commit/34f354b2a0eeb6c148ca485ae3558842814ea4d2)), closes [#3332](https://github.com/vuejs/vue-next/issues/3332)
* **runtime-core:** properties in methods should be writable and enumerable in DEV ([#3301](https://github.com/vuejs/vue-next/issues/3301)) ([e3568ba](https://github.com/vuejs/vue-next/commit/e3568bae276889cee60f4e84321a287125014e86)), closes [#3300](https://github.com/vuejs/vue-next/issues/3300)
* **scheduler:** ensure updates are always inserted in ascending id order ([#3184](https://github.com/vuejs/vue-next/issues/3184)) ([45fae9d](https://github.com/vuejs/vue-next/commit/45fae9d308e8cb9fe3304d4ca03c373ce63b2e62)), closes [#2768](https://github.com/vuejs/vue-next/issues/2768) [#2829](https://github.com/vuejs/vue-next/issues/2829)
* **v-show:** v-show takes higher priority than style attribute ([#3230](https://github.com/vuejs/vue-next/issues/3230)) ([5ad4036](https://github.com/vuejs/vue-next/commit/5ad4036e29f75dc907e95b99a63325b855332566)), closes [#2757](https://github.com/vuejs/vue-next/issues/2757)
* init devtools after feature flag checks ([d0ea745](https://github.com/vuejs/vue-next/commit/d0ea74556f74d8c503ffb7b70f41cbe2ce14db98))


### Performance Improvements

* **reactivity:** only call Set.add if doesn't already have value ([#3307](https://github.com/vuejs/vue-next/issues/3307)) ([9cd9883](https://github.com/vuejs/vue-next/commit/9cd988342cfa32ddd9479585244eb317d74c9712))



## [3.0.6](https://github.com/vuejs/vue-next/compare/v3.0.5...v3.0.6) (2021-02-24)


### Bug Fixes

* **compiler-core:** do not mark v-for as stable on const bindings ([734c65b](https://github.com/vuejs/vue-next/commit/734c65badd8395a78d7beee1fc960aee418361a0)), closes [vitejs/vite#1956](https://github.com/vitejs/vite/issues/1956)
* **compiler-dom:** ensure global build filename matches the one defined in package.json (close [#3181](https://github.com/vuejs/vue-next/issues/3181)) ([#3185](https://github.com/vuejs/vue-next/issues/3185)) ([96b6433](https://github.com/vuejs/vue-next/commit/96b64335242a99432080aeb879e5c0787207a0de))
* **compiler-dom:** fix cdn entries ([fcb6c89](https://github.com/vuejs/vue-next/commit/fcb6c8920c6ee76f57325a178eb9280d7bae4d7c)), closes [#3181](https://github.com/vuejs/vue-next/issues/3181) [#3185](https://github.com/vuejs/vue-next/issues/3185)
* **compiler-sfc:** compiler blank srcset ([#3005](https://github.com/vuejs/vue-next/issues/3005)) ([9dc816d](https://github.com/vuejs/vue-next/commit/9dc816d63468b0a2fa2b6123959310014e121b58))
* **compiler-sfc:** removeSpecifier issue when removing initial imports (script-setup) ([#2729](https://github.com/vuejs/vue-next/issues/2729)) ([6d762a8](https://github.com/vuejs/vue-next/commit/6d762a84ca0ac9a43eb3d0ab0c7b7b17c35c9836))
* **compiler-sfc:** the empty lang attribute should be treated as no lang specified ([#3051](https://github.com/vuejs/vue-next/issues/3051)) ([6d5b623](https://github.com/vuejs/vue-next/commit/6d5b62351248780663d2612a1f483f7ea9f5e5a2))
* **compiler-sfc:** transformAssetUrls.base should not affect known module requests ([2ea9867](https://github.com/vuejs/vue-next/commit/2ea9867398d19148b32643fa0e6523c95b9ca956))
* **compiler-sfc:** treat const reactive() bindings as mutable ([03360ce](https://github.com/vuejs/vue-next/commit/03360cefa1b7038174fa3c1fc3a04400b4cdbbce))
* **compiler-ssr:** avoid duplicated asset imports merged from component slot client branch ([c69f4ea](https://github.com/vuejs/vue-next/commit/c69f4ea857b7db8d26bbde2f80786c8212d16770)), closes [vitejs/vite#2034](https://github.com/vitejs/vite/issues/2034)
* **devtools:** init devtools in production ([#2906](https://github.com/vuejs/vue-next/issues/2906)) ([4d9bcb7](https://github.com/vuejs/vue-next/commit/4d9bcb768ddc294430aedcf27155aaca292c47bd))
* **devtools:** send instance to devtools when it's mounted instead of created ([4fecb27](https://github.com/vuejs/vue-next/commit/4fecb27f8696fdb8f681948543ea81ea62fe43bf))
* **docs:** change reference to passed deadline ([#2930](https://github.com/vuejs/vue-next/issues/2930)) ([de7f9d1](https://github.com/vuejs/vue-next/commit/de7f9d1efd7fa19a908357d3f3a706c52694d8bd))
* **hmr:** deep clone reused hoisted trees during dev ([5a7a1b8](https://github.com/vuejs/vue-next/commit/5a7a1b8293822219283d6e267496bec02234b0bc)), closes [vitejs/vite#2022](https://github.com/vitejs/vite/issues/2022)
* **runtime-core:** align $parent/$root with the template ref when using expose ([#3158](https://github.com/vuejs/vue-next/issues/3158)) ([f43a3b0](https://github.com/vuejs/vue-next/commit/f43a3b0bebf0837223e7b8f046dad63e34cd323b))
* **runtime-core:** allow overriding properties other than props ([#3105](https://github.com/vuejs/vue-next/issues/3105)) ([73117f6](https://github.com/vuejs/vue-next/commit/73117f6b5b1e36c9400248ed9e815839c49a12c8))
* **runtime-core:** check the DEV_ROOT_FRAGMENT flag correctly in the dev environment ([#2750](https://github.com/vuejs/vue-next/issues/2750)) ([347a879](https://github.com/vuejs/vue-next/commit/347a8798a4c5f0b426f3ac84a01d752d823fb51b))
* **runtime-core:** component methods should override global properties in DEV ([#3074](https://github.com/vuejs/vue-next/issues/3074)) ([2587f36](https://github.com/vuejs/vue-next/commit/2587f36fe311359e2e34f40e8e47d2eebfab7f42))
* **runtime-core:** ensure app instance can be garbage collected after unmount (close [#2907](https://github.com/vuejs/vue-next/issues/2907)) ([#2909](https://github.com/vuejs/vue-next/issues/2909)) ([60e05ef](https://github.com/vuejs/vue-next/commit/60e05eff232c3ddfca1c20e52f72aa36165d8a22))
* **runtime-core:** instanceWatch should pass `this.proxy` to source as the first argument ([#2753](https://github.com/vuejs/vue-next/issues/2753)) ([ec8fd10](https://github.com/vuejs/vue-next/commit/ec8fd10cec61c33c7c8056413a1c609ac90e1215))
* **runtime-dom:** ensure readonly type prop on textarea is handled patched as attribute ([#2888](https://github.com/vuejs/vue-next/issues/2888)) ([c5d147c](https://github.com/vuejs/vue-next/commit/c5d147c57f75ca38cc334bb27b61a8bc153494bd)), closes [#2766](https://github.com/vuejs/vue-next/issues/2766)
* kebab-case events are attached correctly on web components, see [#2841](https://github.com/vuejs/vue-next/issues/2841) ([#2847](https://github.com/vuejs/vue-next/issues/2847)) ([b302cbb](https://github.com/vuejs/vue-next/commit/b302cbbbd3fd512f2b8afbd9c873060a40bf8e62))
* **types:** extract the correct props type for the DateConstructor ([#2676](https://github.com/vuejs/vue-next/issues/2676)) ([48f0d29](https://github.com/vuejs/vue-next/commit/48f0d2944f0f9d2f556e62782fc61985897b2ed4))
* ensure all published packages contan a LICENCE file (close [#2650](https://github.com/vuejs/vue-next/issues/2650)) ([#2857](https://github.com/vuejs/vue-next/issues/2857)) ([6a48d23](https://github.com/vuejs/vue-next/commit/6a48d23749e418b44ba17cd3e85f478484fd7ffe))
* remove superfluous spaces when normalizing class ([#3083](https://github.com/vuejs/vue-next/issues/3083)) ([4b55142](https://github.com/vuejs/vue-next/commit/4b551420fc058c4683219db5d75893f9fc69aa04))
* **runtime-dom:** enable set form attr to null on form-elements ([#2840](https://github.com/vuejs/vue-next/issues/2840)) ([#2849](https://github.com/vuejs/vue-next/issues/2849)) ([f262438](https://github.com/vuejs/vue-next/commit/f2624380731cc32e71523e8c2c98037e98e09319))
* **toRef:** ref created from union typed prop can't be used in watch ([#3048](https://github.com/vuejs/vue-next/issues/3048)) ([4ca4666](https://github.com/vuejs/vue-next/commit/4ca4666d58ee8025570dc14f1c163bdeac9c6012))
* should prefix `ShadowRoot` with `window.` ([#2943](https://github.com/vuejs/vue-next/issues/2943)) ([97d6f1a](https://github.com/vuejs/vue-next/commit/97d6f1a716045123d0e05600e64f11f92f504747))


### Features

* remove useless option  in KeepAlive ([#3170](https://github.com/vuejs/vue-next/issues/3170)) ([bd1240c](https://github.com/vuejs/vue-next/commit/bd1240c1270b610c4ffcf6c32e2bbe2c9265020f))
* **compiler-core:** support `BigInt` in template ([#2900](https://github.com/vuejs/vue-next/issues/2900)) ([c9f94fa](https://github.com/vuejs/vue-next/commit/c9f94fa3cfbe8fcd9ea3d49d523dfb282c468369))
* **compiler-sfc:** upgrade to postcss 8 ([#2710](https://github.com/vuejs/vue-next/issues/2710)) ([49bc2e4](https://github.com/vuejs/vue-next/commit/49bc2e4db568d4f9fa2ccfe4e22c792cfc02651a))
* **runtime-core:** improve render context warning ([#2496](https://github.com/vuejs/vue-next/issues/2496)) ([288ae0a](https://github.com/vuejs/vue-next/commit/288ae0a8d9444365ad7438462e072c425150cbf1))
* **runtime-core:** props type support `BigInt` ([#2891](https://github.com/vuejs/vue-next/issues/2891)) ([ffd5288](https://github.com/vuejs/vue-next/commit/ffd52885453d1621e45dff645ff1101e74ea40b2))


### Performance Improvements

* **reactivity:** should not track `__isVue` ([#2940](https://github.com/vuejs/vue-next/issues/2940)) ([dd02cf3](https://github.com/vuejs/vue-next/commit/dd02cf37d5f5a6946bcae01ee70568e38a82c177))



## [3.0.5](https://github.com/vuejs/vue-next/compare/v3.0.4...v3.0.5) (2020-12-30)

**Note:** this release contains a type-only change that requires TypeScript 4.0+, which
may cause build issues in projects still using TS 3.x.
### Bug Fixes

* **compiler-core:** fix missing createVNode import on nested v-for ([ad4d391](https://github.com/vuejs/vue-next/commit/ad4d3915d39515a3e9ff2de691f82cb922a314b9)), closes [#2718](https://github.com/vuejs/vue-next/issues/2718)
* **compiler-sfc:** should keep template nodes with no content ([#2468](https://github.com/vuejs/vue-next/issues/2468)) ([5b9b37f](https://github.com/vuejs/vue-next/commit/5b9b37fc9b363be2989c1e9d76ab6e950cdfe2ad)), closes [#2463](https://github.com/vuejs/vue-next/issues/2463)
* **compiler-sfc:** support transforming asset urls with full base url. ([#2477](https://github.com/vuejs/vue-next/issues/2477)) ([db786b1](https://github.com/vuejs/vue-next/commit/db786b1afe41c26611a215e6d6599d50312b9c2f))
* **runtime-core:** component mount anchor memory leak ([#2459](https://github.com/vuejs/vue-next/issues/2459)) ([3867bb4](https://github.com/vuejs/vue-next/commit/3867bb4c14131ef94098a62bffba97a5b7d1fe66)), closes [#2458](https://github.com/vuejs/vue-next/issues/2458)
* **runtime-core:** skip patchBlockChildren if n1.dynamicChildren is null ([#2717](https://github.com/vuejs/vue-next/issues/2717)) ([c59897c](https://github.com/vuejs/vue-next/commit/c59897c7b0dbd82b5bbf3fbca945c0639ac37fb8)), closes [#2715](https://github.com/vuejs/vue-next/issues/2715) [#2485](https://github.com/vuejs/vue-next/issues/2485)
* **runtime-dom:** support mounting app on ShadowRoot ([#2447](https://github.com/vuejs/vue-next/issues/2447)) ([b2189ba](https://github.com/vuejs/vue-next/commit/b2189ba2f3400ab6bf9ee75b56ac11e65f7bd061)), closes [#2399](https://github.com/vuejs/vue-next/issues/2399)
* **ssr:** properly handle ssr empty slot and fallback ([88f6b33](https://github.com/vuejs/vue-next/commit/88f6b33d054c18802375ec99c4a57e4acc649a02))
* **transition:** ensure manual style manipulation in transition leave hooks work ([cbaa380](https://github.com/vuejs/vue-next/commit/cbaa3805064cb581fc2007cf63774c91d39844fe)), closes [#2720](https://github.com/vuejs/vue-next/issues/2720)
* **transition:** ensure styles from *-leave-active trigger transition ([#2716](https://github.com/vuejs/vue-next/issues/2716)) ([3f8f9b6](https://github.com/vuejs/vue-next/commit/3f8f9b67b3b54a7ae8405baf6d28be7ec074509d)), closes [#2712](https://github.com/vuejs/vue-next/issues/2712)


### Features

* **devtools:** send instance ([3626ff0](https://github.com/vuejs/vue-next/commit/3626ff07fe5107080c52e85018070562c84b796e))



## [3.0.4](https://github.com/vuejs/vue-next/compare/v3.0.3...v3.0.4) (2020-12-02)


### Bug Fixes

* **async-component:** forward refs on async component wrapper ([64d4681](https://github.com/vuejs/vue-next/commit/64d4681e4b9d88e17cd1515014866d43d0424d14)), closes [#2671](https://github.com/vuejs/vue-next/issues/2671)
* **attr-fallthrough:** ensure consistent attr fallthrough for root fragments with comments ([3bc2914](https://github.com/vuejs/vue-next/commit/3bc2914e32b030b1247659f871f6055827154087)), closes [#2549](https://github.com/vuejs/vue-next/issues/2549)
* **build:** enable safari10 option for terser ([#2472](https://github.com/vuejs/vue-next/issues/2472)) ([20a704f](https://github.com/vuejs/vue-next/commit/20a704fc043b29c3c9baac602211c595ede728cf)), closes [#2470](https://github.com/vuejs/vue-next/issues/2470)
* **compiler-core:** fix scope var reference check for v-on expressions ([9db7095](https://github.com/vuejs/vue-next/commit/9db70959621c7df44807324a3b1a41caa2b261eb)), closes [#2564](https://github.com/vuejs/vue-next/issues/2564)
* **compiler-core:** fix unintended imports in esm-bundler builds ([55d99d7](https://github.com/vuejs/vue-next/commit/55d99d729e147fae515c12148590f0100508c49d)), closes [#2258](https://github.com/vuejs/vue-next/issues/2258) [#2515](https://github.com/vuejs/vue-next/issues/2515)
* **compiler-core:** transform kebab case props to camelcase on slots ([#2490](https://github.com/vuejs/vue-next/issues/2490)) ([ef59a30](https://github.com/vuejs/vue-next/commit/ef59a30cabd12f6f14fee210a7fe49bccd3fd86c)), closes [#2488](https://github.com/vuejs/vue-next/issues/2488)
* **compiler-core/v-on:** handle falsy values when caching v-on handlers ([e4f09c1](https://github.com/vuejs/vue-next/commit/e4f09c1419352c18a60a5930d9526d916d1323d3)), closes [#2605](https://github.com/vuejs/vue-next/issues/2605)
* **compiler-sfc:** fix parsing error when `lang=""` is used on plain element ([#2569](https://github.com/vuejs/vue-next/issues/2569)) ([5f2a853](https://github.com/vuejs/vue-next/commit/5f2a8533acc332528faedb2d1b6ecdae104087a4)), closes [#2566](https://github.com/vuejs/vue-next/issues/2566)
* **compiler-sfc:** named imports from .vue file should not be treated as constant ([085bbd5](https://github.com/vuejs/vue-next/commit/085bbd5fe07c52056e9f7151fbaed8f6a2e442b3)), closes [#2699](https://github.com/vuejs/vue-next/issues/2699)
* **compiler-sfc:** should not remove import statements with no specifier when compiling script setup ([43eab92](https://github.com/vuejs/vue-next/commit/43eab923ea651079181490d191966ff28988e9c8))
* **compiler-ssr:** generate correct children for transition-group ([a5d6f80](https://github.com/vuejs/vue-next/commit/a5d6f8091e3761447b7fec0e3d1346eb83402a0a)), closes [#2510](https://github.com/vuejs/vue-next/issues/2510)
* **compiler-ssr:** handle v-model checkbox with true-value binding ([fe5428d](https://github.com/vuejs/vue-next/commit/fe5428db1207747886957b831d46d71ecb6fadaa))
* **compiler-ssr:** should not render key/ref bindings in ssr ([5b62662](https://github.com/vuejs/vue-next/commit/5b6266284da01008e2f68ed353a622adc5704261))
* **provide:** support symbols in applyOptions ([#2616](https://github.com/vuejs/vue-next/issues/2616)) ([7a1a782](https://github.com/vuejs/vue-next/commit/7a1a782642a13d5fcc6b8c738a5ce8f8c657e1b5)), closes [#2615](https://github.com/vuejs/vue-next/issues/2615)
* **reactivity:** ensure  readonly on plain arrays doesn't track array methods. ([#2506](https://github.com/vuejs/vue-next/issues/2506)) ([3470308](https://github.com/vuejs/vue-next/commit/34703082fd5afacee774ee92c11753119032ed1a)), closes [#2493](https://github.com/vuejs/vue-next/issues/2493)
* **reactivity:** ensure add/set on reactive collections return the proxy ([#2534](https://github.com/vuejs/vue-next/issues/2534)) ([6e46a57](https://github.com/vuejs/vue-next/commit/6e46a574eddb5fa43c8a4ce10c620ecdf1caf3b8)), closes [#2530](https://github.com/vuejs/vue-next/issues/2530)
* **runtime-core:** ensure keep-alive deep-watches include/explude props ([#2551](https://github.com/vuejs/vue-next/issues/2551)) ([421205d](https://github.com/vuejs/vue-next/commit/421205d0ad1ab187ff72be754e38c7228230eb60)), closes [#2550](https://github.com/vuejs/vue-next/issues/2550)
* **runtime-core:** ensure watchers are always registered to correct instance owner ([#2495](https://github.com/vuejs/vue-next/issues/2495)) ([735af1c](https://github.com/vuejs/vue-next/commit/735af1c7b7e764c410b8dd671eaaa9a72f09ea3f)), closes [#2381](https://github.com/vuejs/vue-next/issues/2381)
* **runtime-core:** fix emit listener check on kebab-case events ([#2542](https://github.com/vuejs/vue-next/issues/2542)) ([3532b2b](https://github.com/vuejs/vue-next/commit/3532b2b0213268a285cacce9b38f806e6af29a61)), closes [#2540](https://github.com/vuejs/vue-next/issues/2540)
* **runtime-core:** handle static node move in production ([bf16a57](https://github.com/vuejs/vue-next/commit/bf16a57fc3d23118c670918348f02457cfcc44d6))
* **runtime-core:** remove static node in production mode ([#2556](https://github.com/vuejs/vue-next/issues/2556)) ([2a9ba0c](https://github.com/vuejs/vue-next/commit/2a9ba0c8e961ed6c68a8008ccbef85ff2cabeeb2)), closes [#2553](https://github.com/vuejs/vue-next/issues/2553)
* **runtime-core:** should pause tracking when initializing legacy options ([#2524](https://github.com/vuejs/vue-next/issues/2524)) ([0ff2a4f](https://github.com/vuejs/vue-next/commit/0ff2a4f1c1847a4e173dcab810e6438143a4272c)), closes [#2521](https://github.com/vuejs/vue-next/issues/2521)
* **runtime-core:** skip functional components in public $parent chain traversal ([53f4885](https://github.com/vuejs/vue-next/commit/53f4885d9e06f1b1b0b33abc8f1c20766cbb2d1a)), closes [#2437](https://github.com/vuejs/vue-next/issues/2437)
* **runtime-dom:** attribute should be removed with nullish values ([#2679](https://github.com/vuejs/vue-next/issues/2679)) ([fb6b9f8](https://github.com/vuejs/vue-next/commit/fb6b9f8e8ff35ca4d8723a9f96e36266de0dd947)), closes [#2677](https://github.com/vuejs/vue-next/issues/2677)
* **script-setup:** ensure useContext() return valid context ([73cdb9d](https://github.com/vuejs/vue-next/commit/73cdb9d4208f887fe08349657122e39175d7166c))
* **slots:** dynamically named slots should be keyed by name ([2ab8c41](https://github.com/vuejs/vue-next/commit/2ab8c41a1a43952fb229587a9da48d9a1214ab9e)), closes [#2535](https://github.com/vuejs/vue-next/issues/2535)
* **slots:** should render fallback content when slot content contains no valid nodes  ([#2485](https://github.com/vuejs/vue-next/issues/2485)) ([ce4915d](https://github.com/vuejs/vue-next/commit/ce4915d8bed12f4cdb5fa8ca39bda98d0d3aabb7)), closes [#2347](https://github.com/vuejs/vue-next/issues/2347) [#2461](https://github.com/vuejs/vue-next/issues/2461)
* **suspense:** fix nested async child toggle inside already resovled suspense ([cf7f1db](https://github.com/vuejs/vue-next/commit/cf7f1dbc9be8d50ad220e3630c38f5a9a217d693)), closes [#2215](https://github.com/vuejs/vue-next/issues/2215)
* **teleport:** Teleport into SVG elements ([#2648](https://github.com/vuejs/vue-next/issues/2648)) ([cd92836](https://github.com/vuejs/vue-next/commit/cd928362232747a51d1fd4790bb20adcdd59d187)), closes [#2652](https://github.com/vuejs/vue-next/issues/2652)
* **transition:** avoid invoking stale transition end callbacks ([eaf8a67](https://github.com/vuejs/vue-next/commit/eaf8a67c7219e1b79d6abca44a1d7f1b341b58b0)), closes [#2482](https://github.com/vuejs/vue-next/issues/2482)
* **transition:** respect rules in *-leave-from transition class ([#2597](https://github.com/vuejs/vue-next/issues/2597)) ([e2618a6](https://github.com/vuejs/vue-next/commit/e2618a632d4add2819ffb8b575af0da189dc3204)), closes [#2593](https://github.com/vuejs/vue-next/issues/2593)
* **types:** fix ToRefs type on union value types ([e315d84](https://github.com/vuejs/vue-next/commit/e315d84936c82bee8f2cf2369c61b5aaec38f328)), closes [#2687](https://github.com/vuejs/vue-next/issues/2687)
* **v-model:** avoid mutation when using Set models + fix multi select Set model update ([f2b0a8e](https://github.com/vuejs/vue-next/commit/f2b0a8e81d15eb8017c7fca5c1dff0e5f6a5573e))
* **v-model:** respect checkbox true-value/false-value on initial render ([48f00c0](https://github.com/vuejs/vue-next/commit/48f00c0f1b574a235be40c560d2cf373be97615e)), closes [#2694](https://github.com/vuejs/vue-next/issues/2694)
* **v-show:** ensure v-show conflict with inline string style binding ([3cd30c5](https://github.com/vuejs/vue-next/commit/3cd30c5245da0733f9eb6f29d220f39c46518162)), closes [#2583](https://github.com/vuejs/vue-next/issues/2583)
* allow hmr in all builds ([46d80f4](https://github.com/vuejs/vue-next/commit/46d80f4d585195446e7f8cf4ba42d00a98e9ee5d)), closes [#2571](https://github.com/vuejs/vue-next/issues/2571)


### Features

* **sfc:** allow sfcs to recursively self-reference in template via name inferred from filename ([67d1aac](https://github.com/vuejs/vue-next/commit/67d1aac6ae683a3a7291dff15071d1eeacb7d22a))



## [3.0.3](https://github.com/vuejs/vue-next/compare/v3.0.2...v3.0.3) (2020-11-25)


### Bug Fixes

* **compiler-core/compiler-sfc:** handle destructure assignment expressions ([4c6078c](https://github.com/vuejs/vue-next/commit/4c6078ce25226ab9e10ec4eba5c745058f670b3d))
* **compiler-sfc:** fix script setup ts helpers ([6e3abc8](https://github.com/vuejs/vue-next/commit/6e3abc86058f967bcf6fad94c62572989d4dbcbc))
* **hmr:** fix updates for imported but not yet rendered components ([9c23ddf](https://github.com/vuejs/vue-next/commit/9c23ddf9c593dcf6d20bc911ec95d9b674f23dc8))
* **runtime-core:** components with static props and slots should not be force updated ([51e43e0](https://github.com/vuejs/vue-next/commit/51e43e07998eeade153c42a9a9b3eda8fe885c88))
* **runtime-core:** ensure scheduler queue is always non-null ([#2567](https://github.com/vuejs/vue-next/issues/2567)) ([af95604](https://github.com/vuejs/vue-next/commit/af9560455d9719a4c5f0d6588d04bfb4c06c8654))
* **runtime-dom:** use correct import source ([f28ca55](https://github.com/vuejs/vue-next/commit/f28ca556925147bb109d5ba77c5dafaf17d57322))
* **style-vars:** apply css vars in post flush effect ([3a6b120](https://github.com/vuejs/vue-next/commit/3a6b1207fa39cb35eed5bae0b5fdcdb465926bca))
* handle case of ref declaration without initial value ([8485cd4](https://github.com/vuejs/vue-next/commit/8485cd48437bf47880a61b03c57090e8bfdf527b))
* **types:** ensure correct type for toRef and toRefs on existing refs ([8e20375](https://github.com/vuejs/vue-next/commit/8e2037537219219d5ab6456e8a29bd0235eac311))


### Experimental Features

> Note: support for experimental features in SFCs have been updated according to changes in ongoing RFCs. This release may break existing usage of such experimental features.

* **compiler-sfc:** compileScript inline render function mode ([886ed76](https://github.com/vuejs/vue-next/commit/886ed7681dd203c07ff3b504538328f43e14d9b0))
* **compiler-sfc:** new script setup implementation ([556560f](https://github.com/vuejs/vue-next/commit/556560fae31d9e406cfae656089657b6332686c1))
* **compiler-sfc:** new SFC css varaible injection implementation ([41bb7fa](https://github.com/vuejs/vue-next/commit/41bb7fa330e78c4a354a2e67742bd13bee2f4293))
* **compiler-sfc:** support kebab-case components in `<script setup>` sfc template ([3f99e23](https://github.com/vuejs/vue-next/commit/3f99e239e03a8861c462d4ee91feb82066ab3e28))
* **runtime-core:** explicit expose API ([0e59770](https://github.com/vuejs/vue-next/commit/0e59770b9282992f6a5af4d8fef33dafb948fc8b))


### Reverts

* Revert "wip: allow scriptCompiled to be cached on sfc descriptor" ([9db4288](https://github.com/vuejs/vue-next/commit/9db42889e65a0e80cdbae5c19d76dab4f9fadb6d))



## [3.0.2](https://github.com/vuejs/vue-next/compare/v3.0.1...v3.0.2) (2020-10-20)


### Bug Fixes

* **compiler:** stringify values on v-text ([#2432](https://github.com/vuejs/vue-next/issues/2432)) ([314ab2c](https://github.com/vuejs/vue-next/commit/314ab2c7c5dec56d9b117ac3bb988f19d92cf126)), closes [#2430](https://github.com/vuejs/vue-next/issues/2430)
* **compiler-core:** fix multiline member expression check ([#2436](https://github.com/vuejs/vue-next/issues/2436)) ([6d2a1cb](https://github.com/vuejs/vue-next/commit/6d2a1cb64d090c482ed2cde7311f81b33e0f8d90)), closes [#2426](https://github.com/vuejs/vue-next/issues/2426)
* **reactivity:** track length on for in iteration on Array ([0e5a3c4](https://github.com/vuejs/vue-next/commit/0e5a3c47a7398dfd0107fccf9b615772dd01aa74)), closes [#2427](https://github.com/vuejs/vue-next/issues/2427)
* **runtime-core:** avoid mutating EMPTY_ARR when setting dev root ([#2419](https://github.com/vuejs/vue-next/issues/2419)) ([edd49dc](https://github.com/vuejs/vue-next/commit/edd49dcab40eb3faa44248772b176d5eebfd30fe)), closes [#2413](https://github.com/vuejs/vue-next/issues/2413)
* **runtime-core:** avoid object prototype keys in property access cache ([#2416](https://github.com/vuejs/vue-next/issues/2416)) ([ba881f9](https://github.com/vuejs/vue-next/commit/ba881f9190510c613f04950b69d78f6af1a90e06))
* **runtime-core:** fix component .once listener logic ([4bbb2b2](https://github.com/vuejs/vue-next/commit/4bbb2b2ee6866ed80cb542c2ff24207b4bd09bda))
* **runtime-core:** non-stable Fragment should always unmount its children ([#2445](https://github.com/vuejs/vue-next/issues/2445)) ([fff62e2](https://github.com/vuejs/vue-next/commit/fff62e2ee8accf31bb5ac5abdb4c0636216cfd0e)), closes [#2444](https://github.com/vuejs/vue-next/issues/2444)
* **runtime-core:** prevent self-injection ([#2424](https://github.com/vuejs/vue-next/issues/2424)) ([111d04f](https://github.com/vuejs/vue-next/commit/111d04f119a2b2d0b1a1790a063b152c17787943)), closes [#2400](https://github.com/vuejs/vue-next/issues/2400)
* **suspense:** fix suspense nested child updates in template mode ([0227b4a](https://github.com/vuejs/vue-next/commit/0227b4a697afd598f6fa279a1a7ce84242e68f43)), closes [#2214](https://github.com/vuejs/vue-next/issues/2214)
* **types:** h support for resolveComponent ([#2402](https://github.com/vuejs/vue-next/issues/2402)) ([1f2a652](https://github.com/vuejs/vue-next/commit/1f2a652a9d2e3bec472fb1786a4c16d6ccfa1fb1)), closes [#2357](https://github.com/vuejs/vue-next/issues/2357)
* **v-model:** built in modifiers support on component  ([#2348](https://github.com/vuejs/vue-next/issues/2348)) ([128ec46](https://github.com/vuejs/vue-next/commit/128ec460ec00ca8672352d019b264c80dfd0c3b0)), closes [#2326](https://github.com/vuejs/vue-next/issues/2326)


### Features

* **compile-core:** handle falsy dynamic args for v-on and v-bind ([#2393](https://github.com/vuejs/vue-next/issues/2393)) ([052a621](https://github.com/vuejs/vue-next/commit/052a621762c5f7c420464747ebbbed27c7350593)), closes [#2388](https://github.com/vuejs/vue-next/issues/2388)



## [3.0.1](https://github.com/vuejs/vue-next/compare/v3.0.0...v3.0.1) (2020-10-15)


### Bug Fixes

* **compiler-core:** allow spaces between if-else branches ([#2305](https://github.com/vuejs/vue-next/issues/2305)) ([89c5909](https://github.com/vuejs/vue-next/commit/89c5909a6f063dddcdf61650a6ed08f8be138521)), closes [#2299](https://github.com/vuejs/vue-next/issues/2299)
* **compiler-core:** consistently remove comment nodes for pre tags in production ([f411924](https://github.com/vuejs/vue-next/commit/f4119249f2d3f394469028ad9664f61830540ff9)), closes [#2217](https://github.com/vuejs/vue-next/issues/2217)
* **compiler-core:** fix v-if key injection with v-on object syntax ([#2368](https://github.com/vuejs/vue-next/issues/2368)) ([692197b](https://github.com/vuejs/vue-next/commit/692197be33de8f73a605e3a7f71389be42613ee3)), closes [#2366](https://github.com/vuejs/vue-next/issues/2366)
* **compiler-core:** make v-once work with v-if/else-if/else ([#2182](https://github.com/vuejs/vue-next/issues/2182)) ([9499871](https://github.com/vuejs/vue-next/commit/94998715822589f6f10443b6dba75f193467845d)), closes [#2035](https://github.com/vuejs/vue-next/issues/2035)
* **compiler-ssr:** fix SSR issue when dynamic and static class co-exist ([#2354](https://github.com/vuejs/vue-next/issues/2354)) ([8539c0b](https://github.com/vuejs/vue-next/commit/8539c0bf32e86fb16349a210f878681579fb7976))
* **hmr:** full diff props for non-sfc component ([#2359](https://github.com/vuejs/vue-next/issues/2359)) ([e78915a](https://github.com/vuejs/vue-next/commit/e78915a74045ebcf34e8e99064fff48cd044632c))
* **reactivity:** should add allowRecurse to the effect ([#2213](https://github.com/vuejs/vue-next/issues/2213)) ([ea1f87e](https://github.com/vuejs/vue-next/commit/ea1f87eabf2deab2e586af7ebd2d74bb58f72b87)), closes [#2200](https://github.com/vuejs/vue-next/issues/2200)
* **reactivity:** should not trigger watch on computed ref when value is unchanged ([390589e](https://github.com/vuejs/vue-next/commit/390589ec6d977675c5cef2807fbf3e930a25eef0)), closes [#2231](https://github.com/vuejs/vue-next/issues/2231)
* **reactivity:** use resetTracking instead of enableTracking ([#2174](https://github.com/vuejs/vue-next/issues/2174)) ([7cc09ca](https://github.com/vuejs/vue-next/commit/7cc09ca8a581783c2391824885206348e5e99934))
* **runtime-core:** ensure this context for $nextTick callback ([5c3e8e9](https://github.com/vuejs/vue-next/commit/5c3e8e984029711c97ca671fa098cf66483dd571)), closes [#2282](https://github.com/vuejs/vue-next/issues/2282)
* **runtime-core:** error handling for created/beforeCreate hooks ([b392fe4](https://github.com/vuejs/vue-next/commit/b392fe419c7486de62fac8f25640fe0836bef02e)), closes [#2268](https://github.com/vuejs/vue-next/issues/2268)
* **runtime-core:** fix directive merging on component root ([4d1ebb5](https://github.com/vuejs/vue-next/commit/4d1ebb5deb4c1cb2a02e8482bf8f9cc87197b088)), closes [#2298](https://github.com/vuejs/vue-next/issues/2298)
* **runtime-core:** fix duplicated unmount traversal in optimized mode ([376883d](https://github.com/vuejs/vue-next/commit/376883d1cfea6ed92807cce1f1209f943a04b625)), closes [#2169](https://github.com/vuejs/vue-next/issues/2169)
* **runtime-core:** fix provide function data access in extends/mixins ([f06518a](https://github.com/vuejs/vue-next/commit/f06518a8c9201b4fa2a956595aa9d89a192fcd20)), closes [#2300](https://github.com/vuejs/vue-next/issues/2300)
* **runtime-core:** fix SSR memoery leak due to props normalization cache ([a66e53a](https://github.com/vuejs/vue-next/commit/a66e53a24f445b688eef6812ecb872dc53cf2702)), closes [#2225](https://github.com/vuejs/vue-next/issues/2225)
* **runtime-core:** make errorCaptured return value handling consistent with Vue 2 ([#2289](https://github.com/vuejs/vue-next/issues/2289)) ([4d20ac8](https://github.com/vuejs/vue-next/commit/4d20ac8173f84c87288255dcc03c62a6ee862a23)), closes [#2267](https://github.com/vuejs/vue-next/issues/2267)
* **runtime-core:** use consistent camelCase event casing for render functions ([#2278](https://github.com/vuejs/vue-next/issues/2278)) ([62f2617](https://github.com/vuejs/vue-next/commit/62f26173ba715fd8bf2b131e19d94275106e830d)), closes [#2249](https://github.com/vuejs/vue-next/issues/2249)
* **runtime-core:** vnode.el is null in watcher after rerendering ([#2295](https://github.com/vuejs/vue-next/issues/2295)) ([28d5fd7](https://github.com/vuejs/vue-next/commit/28d5fd7a2871c10df3427dfbbe0e203c2a976cb4)), closes [#2170](https://github.com/vuejs/vue-next/issues/2170)
* **runtime-core/template-refs:** do not reset refs object before updates ([25d53f0](https://github.com/vuejs/vue-next/commit/25d53f09bbf55412a003eabb7a390dc8434f8987)), closes [#2283](https://github.com/vuejs/vue-next/issues/2283)
* **runtime-dom:** v-model should support number modifier with select tag ([#2308](https://github.com/vuejs/vue-next/issues/2308)) ([d744b8a](https://github.com/vuejs/vue-next/commit/d744b8a2dc7653c3e5e43e5379dbf72cf4c9ff2c)), closes [#2252](https://github.com/vuejs/vue-next/issues/2252)
* **sfc/style-vars:** should attach css vars while `subtree` changed ([#2178](https://github.com/vuejs/vue-next/issues/2178)) ([408a8ca](https://github.com/vuejs/vue-next/commit/408a8cad48f5fe0854c83a979ff98f03738fbfba)), closes [#2177](https://github.com/vuejs/vue-next/issues/2177)
* **teleport:** proper children traversal when teleport is block root ([2ae3b26](https://github.com/vuejs/vue-next/commit/2ae3b26679faf2d5393998ba806b99748679195a)), closes [#2324](https://github.com/vuejs/vue-next/issues/2324)
* **teleport:** should only force remove teleport when not disabled ([b0931dc](https://github.com/vuejs/vue-next/commit/b0931dcabaa2858ba76102f49878771ec14fb2e8)), closes [#2323](https://github.com/vuejs/vue-next/issues/2323)
* **types:** avoid DefineComponent defaulting to any ([6aa2256](https://github.com/vuejs/vue-next/commit/6aa2256913bfd097500aba83b78482b87107c101)), closes [#2192](https://github.com/vuejs/vue-next/issues/2192)
* **types:** fix using tuple type as EmitsOptions ([#2160](https://github.com/vuejs/vue-next/issues/2160)) ([5dbd6b3](https://github.com/vuejs/vue-next/commit/5dbd6b36a0666fc6c993115ee5281ef253ba8a68)), closes [#2159](https://github.com/vuejs/vue-next/issues/2159)
* **v-for:**  handle and warn when `v-for` receives non-integer range number ([#2247](https://github.com/vuejs/vue-next/issues/2247)) ([02f355e](https://github.com/vuejs/vue-next/commit/02f355eb69df32a03e942e01ac1de654d26916a1)), closes [#2245](https://github.com/vuejs/vue-next/issues/2245)
* **v-model:** avoid clearing IME compose state on updates ([#2304](https://github.com/vuejs/vue-next/issues/2304)) ([fbd198f](https://github.com/vuejs/vue-next/commit/fbd198fbfe2f87c3c15a63d9770d00bf3fc9c142)), closes [#2302](https://github.com/vuejs/vue-next/issues/2302)
* **v-model:** ensure initial value is set after other attributes ([54ed759](https://github.com/vuejs/vue-next/commit/54ed7592e416fc411196e9b767aebcc4f2ca20d8)), closes [#2325](https://github.com/vuejs/vue-next/issues/2325)


### Features

* custom formatters ([6ba7ba4](https://github.com/vuejs/vue-next/commit/6ba7ba47d59288b8cd39c985a2163ebd220607bc))


### Performance Improvements

* **runtime-dom/vModel:** remove looseHas if model is Set ([#2236](https://github.com/vuejs/vue-next/issues/2236)) ([6a554fe](https://github.com/vuejs/vue-next/commit/6a554feb13487132ed7631f80a1efe8c41991346))
* do not enable hmr in non-browser envs ([cf2c9f6](https://github.com/vuejs/vue-next/commit/cf2c9f6faa95add4c23b20c4b8a6e477d05ff0ed))



# [3.0.0](https://github.com/vuejs/vue-next/compare/v3.0.0-rc.13...v3.0.0) (2020-09-18)



# [3.0.0-rc.13](https://github.com/vuejs/vue-next/compare/v3.0.0-rc.12...v3.0.0-rc.13) (2020-09-18)


### Bug Fixes

* **hmr:** make hmr working with class components ([#2144](https://github.com/vuejs/vue-next/issues/2144)) ([422f05e](https://github.com/vuejs/vue-next/commit/422f05e085036e23ea3632c2ce75d86181a087b8))
* **reactivity:** avoid length mutating array methods causing infinite updates ([#2138](https://github.com/vuejs/vue-next/issues/2138)) ([f316a33](https://github.com/vuejs/vue-next/commit/f316a332b055d3f448dc735365551d89041f1098)), closes [#2137](https://github.com/vuejs/vue-next/issues/2137)
* **suspense:** should discard unmount effects of invalidated pending branch ([5bfcad1](https://github.com/vuejs/vue-next/commit/5bfcad155b444b2f7ffaac171c1f61bc23909287))
* **types:** component instance inference without props ([#2145](https://github.com/vuejs/vue-next/issues/2145)) ([57bdaa2](https://github.com/vuejs/vue-next/commit/57bdaa2220afefbde21118659c1ce2377d6b86d6))


### Code Refactoring

* watch APIs default to trigger pre-flush ([49bb447](https://github.com/vuejs/vue-next/commit/49bb44756fda0a7019c69f2fa6b880d9e41125aa)), closes [/github.com/vuejs/vue-next/issues/1706#issuecomment-666258948](https://github.com//github.com/vuejs/vue-next/issues/1706/issues/issuecomment-666258948)


### Features

* **runtime-core:** support using inject() inside props default functions ([58c31e3](https://github.com/vuejs/vue-next/commit/58c31e36992d2647e5247de4904246fb2d6112ed))
* **watch:** support dot-delimited path in watch option ([1c9a0b3](https://github.com/vuejs/vue-next/commit/1c9a0b3e195d144ac90d22d2cc2cef6a3fd8276d))


### BREAKING CHANGES

* watch APIs now default to use `flush: 'pre'` instead of
`flush: 'post'`. This change affects `watch`, `watchEffect`, the `watch` component option, and `this.$watch`. See ([49bb447](https://github.com/vuejs/vue-next/commit/49bb44756fda0a7019c69f2fa6b880d9e41125aa)) for more details.

# [3.0.0-rc.12](https://github.com/vuejs/vue-next/compare/v3.0.0-rc.11...v3.0.0-rc.12) (2020-09-16)


### Bug Fixes

* **reactivity:** effect should only recursively self trigger with explicit options ([3810de7](https://github.com/vuejs/vue-next/commit/3810de7d6bd0044177f043285228c2e988093883)), closes [#2125](https://github.com/vuejs/vue-next/issues/2125)
* **runtime-core:** ensure root stable fragments inherit elements for moving ([bebd44f](https://github.com/vuejs/vue-next/commit/bebd44f793ccd13bfdf90c7e45eac320a340650c)), closes [#2134](https://github.com/vuejs/vue-next/issues/2134)
* **runtime-core:** should still do full traverse of stable fragment children in dev + hmr ([dd40ad8](https://github.com/vuejs/vue-next/commit/dd40ad8fca47af0e1f0a963be2f48c23f7457952))
* **runtime-core/async-component:** fix error component when there are no error handlers ([c7b4a37](https://github.com/vuejs/vue-next/commit/c7b4a379cf8627c79a01d61039d3e3b283477dc1)), closes [#2129](https://github.com/vuejs/vue-next/issues/2129)
* **types/tsx:** optional props from Mixin/Extends are treated as required ([#2048](https://github.com/vuejs/vue-next/issues/2048)) ([89e9ab8](https://github.com/vuejs/vue-next/commit/89e9ab8a2a387f26a370848db0b1ffb1d0ab9549))


### Features

* **compiler-sfc:** `additionalData` support for css preprocessors ([#2126](https://github.com/vuejs/vue-next/issues/2126)) ([066d514](https://github.com/vuejs/vue-next/commit/066d514d757fb7e8844104210d7d04cc11598fef))



# [3.0.0-rc.11](https://github.com/vuejs/vue-next/compare/v3.0.0-rc.10...v3.0.0-rc.11) (2020-09-15)


### Bug Fixes

* **compiler-core:** fix prefixing for `<template v-for>` key expressions ([be946ea](https://github.com/vuejs/vue-next/commit/be946ea549d5073274813ed15348bdbfabcaa30c)), closes [#2085](https://github.com/vuejs/vue-next/issues/2085)
* **compiler-core:** fix v-if block handling for components that fail to resolve ([a096a58](https://github.com/vuejs/vue-next/commit/a096a58e412dc37ae618a3b4702f591c580d376a)), closes [#2058](https://github.com/vuejs/vue-next/issues/2058)
* **compiler-sfc:** should extract comment for import or type declarations ([#2107](https://github.com/vuejs/vue-next/issues/2107)) ([05df696](https://github.com/vuejs/vue-next/commit/05df696a2b846a249f2569f4d6183c16e4be88e7)), closes [#2102](https://github.com/vuejs/vue-next/issues/2102)
* **compiler-ssr:** correct the variable name generated by the generator ([#2065](https://github.com/vuejs/vue-next/issues/2065)) ([aa8dc9a](https://github.com/vuejs/vue-next/commit/aa8dc9a50706e6407978da3c43d7e4d2eb292d56))
* **compiler-ssr/teleport:** correct the target prop of teleport ([#2053](https://github.com/vuejs/vue-next/issues/2053)) ([7455dca](https://github.com/vuejs/vue-next/commit/7455dca11cea22f26a7c72628f6b61ad02856bfc))
* **inject:** fix support for inject option default function ([d472461](https://github.com/vuejs/vue-next/commit/d4724619fc3d005311f27c1ac7cab0a0e735c4d2)), closes [#2050](https://github.com/vuejs/vue-next/issues/2050)
* **keep-alive:** should use onMounted and onUpdated to invoke cacheSubtree ([#1984](https://github.com/vuejs/vue-next/issues/1984)) ([890ca8a](https://github.com/vuejs/vue-next/commit/890ca8aa346e77002e0ffbc497018bdc5a6f8125))
* **KeepAlive:** when exclude prop change, it should prune cache that not matched ([#2111](https://github.com/vuejs/vue-next/issues/2111)) ([98cc1f9](https://github.com/vuejs/vue-next/commit/98cc1f9d848edf9a58315018d57885f983bb5baa))
* **reactivity:** `toRef` should not wrap a `ref` ([#2103](https://github.com/vuejs/vue-next/issues/2103)) ([d4bf9bc](https://github.com/vuejs/vue-next/commit/d4bf9bcbb430fa0168ca48039579d59e6789c6f5))
* should be able to parse  decorators in script lang="ts" & jsx ([#2088](https://github.com/vuejs/vue-next/issues/2088)) ([273d19a](https://github.com/vuejs/vue-next/commit/273d19ad461a46d5b8753be2d2886249947494a6))
* **reactivity:** add NaN prop on Array should not trigger length dependency. ([#1998](https://github.com/vuejs/vue-next/issues/1998)) ([0d4910a](https://github.com/vuejs/vue-next/commit/0d4910a211f6debd8ea5ca414d6308f1028679a3))
* **reactivity:** revert ac81dcf ([5f40539](https://github.com/vuejs/vue-next/commit/5f4053967cb61620d3dd27518f571166d7b5ec8f)), closes [#2043](https://github.com/vuejs/vue-next/issues/2043)
* **reactivity:** should trigger collection's write-function correctly on non-reactive keys ([#1992](https://github.com/vuejs/vue-next/issues/1992)) ([fcf9b2c](https://github.com/vuejs/vue-next/commit/fcf9b2cf194512b35dcad05d79206b1077abb929))
* inherit `el` for static nodes inside keyed `template` fragment ([#2089](https://github.com/vuejs/vue-next/issues/2089)) ([a32870a](https://github.com/vuejs/vue-next/commit/a32870a8f611dd1146bb17d5605b168a7805c73f)), closes [#2080](https://github.com/vuejs/vue-next/issues/2080)
* **runtime-core:** fix priority of option merging ([#2041](https://github.com/vuejs/vue-next/issues/2041)) ([95c07d8](https://github.com/vuejs/vue-next/commit/95c07d8c36a69bfc29e661fbbfb92735c4fe5d3e))
* **runtime-core:** warn reserved prefix for setup return properties and ensure consistent dev/prod behavior ([fa7ab0a](https://github.com/vuejs/vue-next/commit/fa7ab0a7f7a939dc7724930a548805219e6a86c5)), closes [#2042](https://github.com/vuejs/vue-next/issues/2042)
* **runtime-core/inject:** handle optional `from` option in inject object config ([#2073](https://github.com/vuejs/vue-next/issues/2073)) ([313dd06](https://github.com/vuejs/vue-next/commit/313dd06065b1782d67f6881fbd42ae92a7f9cade))
* **runtime-core/refs:** handle multiple merged refs for dynamic component with vnode ([612eb67](https://github.com/vuejs/vue-next/commit/612eb6712a3858e4280946d98153b6f35792c652)), closes [#2078](https://github.com/vuejs/vue-next/issues/2078)
* **sfc:** fix scoped style regression for child component with single root + comment ([6dbc6c4](https://github.com/vuejs/vue-next/commit/6dbc6c4cd0d298d3c6faa6d6aeb318be7a963700)), closes [#2046](https://github.com/vuejs/vue-next/issues/2046)
* **types:** properly infer return type from async setup ([#2051](https://github.com/vuejs/vue-next/issues/2051)) ([24fcf6a](https://github.com/vuejs/vue-next/commit/24fcf6ae7cd75c782a5aa2771aca259542e2a680)), closes [#2049](https://github.com/vuejs/vue-next/issues/2049)


### Features

* update Suspense usage ([#2099](https://github.com/vuejs/vue-next/issues/2099)) ([5ae7380](https://github.com/vuejs/vue-next/commit/5ae7380b4a9144c6a2873d0181a0f21a9a090018))
* **compiler-sfc:** support `additionalData` option in `compileStyle` when processing sass ([#1952](https://github.com/vuejs/vue-next/issues/1952)) ([9377352](https://github.com/vuejs/vue-next/commit/937735251ce2539ce9a087359eb270ce5b260ffe))
* **runtime-dom:** allow native Set as v-model checkbox source ([#1957](https://github.com/vuejs/vue-next/issues/1957)) ([cf1b6c6](https://github.com/vuejs/vue-next/commit/cf1b6c666f45a284494f80981522a3dc4804a683))


### Performance Improvements

* should not trigger child update if changed prop is declared emit listener ([124c385](https://github.com/vuejs/vue-next/commit/124c385bafb40f8df7ec61b612765706015ff0fa)), closes [#2072](https://github.com/vuejs/vue-next/issues/2072)


### Reverts

* Revert "refactor(runtime-core): add @internal for instance.proxy (#1849)" (#2024) ([09a939d](https://github.com/vuejs/vue-next/commit/09a939d37cbfc4e3276c99a741fc6801eea48405)), closes [#1849](https://github.com/vuejs/vue-next/issues/1849) [#2024](https://github.com/vuejs/vue-next/issues/2024)



# [3.0.0-rc.10](https://github.com/vuejs/vue-next/compare/v3.0.0-rc.9...v3.0.0-rc.10) (2020-09-02)


### Bug Fixes

* **devtools:** make el extra properties non-enumerable ([7fd3436](https://github.com/vuejs/vue-next/commit/7fd3436290f3777f77cf4a05268e51353c91b297))
* **runtime-core:** enable block tracking when normalizing plain element with slot children ([#1987](https://github.com/vuejs/vue-next/issues/1987)) ([5b82c48](https://github.com/vuejs/vue-next/commit/5b82c48c7b9ac9debaed3a14792d5d84752f1ca6)), closes [#1980](https://github.com/vuejs/vue-next/issues/1980)
* **runtime-core:** ensure consistent $options merge behavior with 2.x ([#1986](https://github.com/vuejs/vue-next/issues/1986)) ([706b52a](https://github.com/vuejs/vue-next/commit/706b52aadd3f06e644070c9e21f161a806bc38ab)), closes [#1978](https://github.com/vuejs/vue-next/issues/1978) [#1979](https://github.com/vuejs/vue-next/issues/1979)
* **runtime-core:** fix props/emits resolving with global mixins ([8ed0b34](https://github.com/vuejs/vue-next/commit/8ed0b342d49d6a5cf353d17c8426ae9f3c312405)), closes [#1975](https://github.com/vuejs/vue-next/issues/1975)
* **runtime-core:** openBlock() should not be tracked when block tracking is disabled ([ad93fa4](https://github.com/vuejs/vue-next/commit/ad93fa42fc8c32d121c0121083d2f0bb40672737))
* **runtime-core:** v-model listeners that already exists on the component should not be merged ([#2011](https://github.com/vuejs/vue-next/issues/2011)) ([63f1f18](https://github.com/vuejs/vue-next/commit/63f1f18064f809ebfa2c76f9f645ac74b6d412f3)), closes [#1989](https://github.com/vuejs/vue-next/issues/1989)
* **sfc/scoped-style:** inherit scopeId through nested HOCs with inheritAttrs: false ([c0427b4](https://github.com/vuejs/vue-next/commit/c0427b45ffebb4cda24de16fa6365a65e185d2d7)), closes [#1988](https://github.com/vuejs/vue-next/issues/1988)
* **types:** fix `this` type of `this.$watch` ([#2022](https://github.com/vuejs/vue-next/issues/2022)) ([aa757e8](https://github.com/vuejs/vue-next/commit/aa757e8e6d5f8f9ad60b1ec12c4ac9479be73c80))
* **v-once:** fix v-once usage with v-if and v-for ([52e45a9](https://github.com/vuejs/vue-next/commit/52e45a9850b97daccfdb26830047d9529ceba667)), closes [#2035](https://github.com/vuejs/vue-next/issues/2035)


### Features

* **compiler-sfc:** analyze script bindings ([#1962](https://github.com/vuejs/vue-next/issues/1962)) ([4421c00](https://github.com/vuejs/vue-next/commit/4421c009038db9aeeea7f69c90a21243860697e3))
* **devtools:** expose vnode and component on elements ([38ca7e8](https://github.com/vuejs/vue-next/commit/38ca7e8e4ebe46e53c3c4050ce2bb8161aeed633))
* **ssr:** serverPrefetch ([c73b4a0](https://github.com/vuejs/vue-next/commit/c73b4a0e10b7627d2d0d851e9abfeac9b6317e45))


### Performance Improvements

* **reactivity:** no need to proxy has/ownKeys for readonly objects ([691a4b9](https://github.com/vuejs/vue-next/commit/691a4b95305dd506c03725805d603c6824a66aff))



# [3.0.0-rc.9](https://github.com/vuejs/vue-next/compare/v3.0.0-rc.8...v3.0.0-rc.9) (2020-08-26)


### Bug Fixes

* **runtime-core:** class and style should be properly normalized in cloneVNode ([#1967](https://github.com/vuejs/vue-next/issues/1967)) ([9153fc2](https://github.com/vuejs/vue-next/commit/9153fc2d8a5c9d24d79161586c70840ae7b84b8b)), closes [#1964](https://github.com/vuejs/vue-next/issues/1964)
* **runtime-core:** fix resolving assets from mixins and extends ([0cb7f7f](https://github.com/vuejs/vue-next/commit/0cb7f7f880961162a6ca0b51bf308fbf83160eb5)), closes [#1963](https://github.com/vuejs/vue-next/issues/1963)
* **runtime-core:** properly call lifecycle hooks in chained mixins & extends ([#1974](https://github.com/vuejs/vue-next/issues/1974)) ([6df0e73](https://github.com/vuejs/vue-next/commit/6df0e738cb9ae6db0c0e9c3c70d81147521bfe7f)), closes [#1973](https://github.com/vuejs/vue-next/issues/1973)


### Performance Improvements

* **reactivity:** add existing index or non-integer prop on Array should not trigger length dependency ([#1969](https://github.com/vuejs/vue-next/issues/1969)) ([d5c4f6e](https://github.com/vuejs/vue-next/commit/d5c4f6ed4d6feea9be56dcc0859592f03b6a5d9a))
* **reactivity:** avoid triggering Map.has twice on non-reactive keys ([#1972](https://github.com/vuejs/vue-next/issues/1972)) ([97bc30e](https://github.com/vuejs/vue-next/commit/97bc30edadb52e57e29b3c6e36c04ec71916103c))



# [3.0.0-rc.8](https://github.com/vuejs/vue-next/compare/v3.0.0-rc.7...v3.0.0-rc.8) (2020-08-25)


### Bug Fixes

* **devtools:** unmountApp not behind compile flag ([6eb7fd8](https://github.com/vuejs/vue-next/commit/6eb7fd83333d97186d570029e4fdca060fdb328d))
* **hmr:** properly force hmr full component props update ([499bc0b](https://github.com/vuejs/vue-next/commit/499bc0bfc4aedcb6ee4ec55ba823838b5496eba8)), closes [#1942](https://github.com/vuejs/vue-next/issues/1942)
* **keep-alive:** should remove wrapped version of injected keep alive hooks ([#1959](https://github.com/vuejs/vue-next/issues/1959)) ([1ea2400](https://github.com/vuejs/vue-next/commit/1ea24000c8f062f3cdc773e8e254892a05ba0702))
* **reactivity:** fix iOS 12 JSON.stringify error on reactive objects ([016ba11](https://github.com/vuejs/vue-next/commit/016ba116a8715d90858de4244073198958d735ff)), closes [#1916](https://github.com/vuejs/vue-next/issues/1916)
* **runtime-core:** fix data merge order for mixins/extends ([c15311c](https://github.com/vuejs/vue-next/commit/c15311cfe879aa98c06585d731d996fca7633421)), closes [#1953](https://github.com/vuejs/vue-next/issues/1953)
* **runtime-core/scheduler:** handle nested flushPostFlushCbs calls ([36fa42a](https://github.com/vuejs/vue-next/commit/36fa42a88cf3a72b58e507b82b35c56a42e43f09)), closes [#1947](https://github.com/vuejs/vue-next/issues/1947)
* **runtime-dom:** avoid setting unchanged input value ([#1937](https://github.com/vuejs/vue-next/issues/1937)) ([1d55454](https://github.com/vuejs/vue-next/commit/1d55454e61bf18cc2d6fe948c4528a680f67efe5)), closes [#1935](https://github.com/vuejs/vue-next/issues/1935)
* **ssr:** invoke directive created hook during hydration ([57642fa](https://github.com/vuejs/vue-next/commit/57642fac8f33b9ea530cc997f8f7465a0573e123))
* **types:** relax ComponentPublicInstanceConstructor type for class components ([#1943](https://github.com/vuejs/vue-next/issues/1943)) ([67b6e0f](https://github.com/vuejs/vue-next/commit/67b6e0f894400f527fc5b20772ed124738df9446))
* **watch:** traverse refs in deep watch ([#1939](https://github.com/vuejs/vue-next/issues/1939)) ([10293c7](https://github.com/vuejs/vue-next/commit/10293c7a188021db9bb4386e12c490f1daf28126)), closes [#1900](https://github.com/vuejs/vue-next/issues/1900)


### Features

* **devtools:** catch events ([23233dc](https://github.com/vuejs/vue-next/commit/23233dc8b850bf9c6bf24c11d4586865884ddb5f))
* **devtools:** expose setupState target object ([31b99a9](https://github.com/vuejs/vue-next/commit/31b99a9139a32590187a2e4a50ad0654de0034a9))
* **directives:** introduce `created` custom directive hook and ensure ([11804fe](https://github.com/vuejs/vue-next/commit/11804fe93f66d43320498bfea564af1c9f7a9eb7)), closes [#1931](https://github.com/vuejs/vue-next/issues/1931)
* **runtime-core:** support variadic children in `h` for simple JSX compat ([54d06ec](https://github.com/vuejs/vue-next/commit/54d06ec495a1743415de9426962024ffb764e4fe)), closes [#1917](https://github.com/vuejs/vue-next/issues/1917)



# [3.0.0-rc.7](https://github.com/vuejs/vue-next/compare/v3.0.0-rc.6...v3.0.0-rc.7) (2020-08-21)


### Bug Fixes

* **compiler-core:** should attach key to single element child of `<template v-for>` ([#1910](https://github.com/vuejs/vue-next/issues/1910)) ([69cfed6](https://github.com/vuejs/vue-next/commit/69cfed6b313821d1ae7ecb02b63b0aaccb5599c6))
* **reactivity:** unwrap non-index accessed refs on reactive arrays ([#1859](https://github.com/vuejs/vue-next/issues/1859)) ([3c05f8b](https://github.com/vuejs/vue-next/commit/3c05f8bbd6cd0e01bbc5830730852f9a93d8de8a)), closes [#1846](https://github.com/vuejs/vue-next/issues/1846)
* **runtime-core:** correctly track dynamic nodes in renderSlot ([#1911](https://github.com/vuejs/vue-next/issues/1911)) ([7ffb79c](https://github.com/vuejs/vue-next/commit/7ffb79c56318861075a47bd2357e34cde8a6dad9))
* **runtime-core:** disable block tracking when calling compiled slot function in tempalte expressions ([f02e2f9](https://github.com/vuejs/vue-next/commit/f02e2f99d9c2ca95f4fd984d7bd62178eceaa214)), closes [#1745](https://github.com/vuejs/vue-next/issues/1745) [#1918](https://github.com/vuejs/vue-next/issues/1918)
* **teleport:** only inherit el for non-patched nodes ([d4cc7b2](https://github.com/vuejs/vue-next/commit/d4cc7b2496f9ed21ef6cac426697eac058da76bb)), closes [#1903](https://github.com/vuejs/vue-next/issues/1903)


### Performance Improvements

* **reactivity:** improve ref performance by using class-based implementation ([#1900](https://github.com/vuejs/vue-next/issues/1900)) ([07919e0](https://github.com/vuejs/vue-next/commit/07919e00658592ebdb42f0c6f004f631c4bf4d34))



# [3.0.0-rc.6](https://github.com/vuejs/vue-next/compare/v3.0.0-rc.5...v3.0.0-rc.6) (2020-08-19)


### Bug Fixes

* **codeframe:** Added Math.max to prevent RangeError ([#1807](https://github.com/vuejs/vue-next/issues/1807)) ([b14f4a5](https://github.com/vuejs/vue-next/commit/b14f4a505b343b12be846f2455d461027a51641c)), closes [#1806](https://github.com/vuejs/vue-next/issues/1806)
* **compiler-core:** generate NEED_PATCH flag for element with vnode hooks ([24041b7](https://github.com/vuejs/vue-next/commit/24041b7ac1a22ca6c10bf2af81c9250af26bda34))
* **compiler-core:** v-if key error should only be checking same key on different branches ([de0c8a7](https://github.com/vuejs/vue-next/commit/de0c8a7e3e8d2adfae4c4ef992cd5ac6262ca534))
* **compiler-sfc:** custom blocks sourcemap ([#1812](https://github.com/vuejs/vue-next/issues/1812)) ([619efd9](https://github.com/vuejs/vue-next/commit/619efd9ac5a0d38651b7282722e7b347a013411a))
* **keep-alive:** fix activated hook invocation on nested components ([#1743](https://github.com/vuejs/vue-next/issues/1743)) ([233d191](https://github.com/vuejs/vue-next/commit/233d191d0d33802cdf7e2996569372a6442e236a)), closes [#1742](https://github.com/vuejs/vue-next/issues/1742)
* **reactivity:** accept subtypes of collections ([#1864](https://github.com/vuejs/vue-next/issues/1864)) ([d005b57](https://github.com/vuejs/vue-next/commit/d005b578b183f165929e1f921584ce599178cad6))
* **reactivity:** effect should still check sync self-trigger ([ac81dcf](https://github.com/vuejs/vue-next/commit/ac81dcf0cc7f5fc722a0c14d1cc92ece5cc0db07))
* **reactivity:** readonly+reactive collection should also expose readonly+reactive values ([ed43810](https://github.com/vuejs/vue-next/commit/ed4381020fcea0494f19f11bebabd9108f2dafd7)), closes [#1772](https://github.com/vuejs/vue-next/issues/1772)
* **reactivity:** use isExtensible instead of isFrozen ([#1753](https://github.com/vuejs/vue-next/issues/1753)) ([2787c34](https://github.com/vuejs/vue-next/commit/2787c34cd436e3ec4656b6986d9d14d57911a7b5)), closes [#1784](https://github.com/vuejs/vue-next/issues/1784)
* **runtime-core:** avoid manual slot invocation in template expressions interfering with block tracking ([791eff3](https://github.com/vuejs/vue-next/commit/791eff3dfbd6be9ba8d597ecf8d943cd197f9807)), closes [#1745](https://github.com/vuejs/vue-next/issues/1745)
* **runtime-core:** check if the key is string on undefined property warning ([#1731](https://github.com/vuejs/vue-next/issues/1731)) ([ce78eac](https://github.com/vuejs/vue-next/commit/ce78eac8e9cfa75a1409ce09ce9f02d4899188d3))
* **runtime-core:** fix beforeUpdate call timing to allow state mutation ([1eb6067](https://github.com/vuejs/vue-next/commit/1eb6067a8598730c67b3b3a4ac459d2723aa858c)), closes [#1899](https://github.com/vuejs/vue-next/issues/1899)
* **runtime-core:** fix Object props validation for objects with custom toStringTag ([6ccd9ac](https://github.com/vuejs/vue-next/commit/6ccd9ac2bc8ea09978fbb99c272bff6614387e90)), closes [#1872](https://github.com/vuejs/vue-next/issues/1872)
* **runtime-core:** separate null vs. non-null ref value updates ([#1835](https://github.com/vuejs/vue-next/issues/1835)) ([3991ff0](https://github.com/vuejs/vue-next/commit/3991ff03ceea89bbc149e864f754196d20c81f90)), closes [#1789](https://github.com/vuejs/vue-next/issues/1789) [#1834](https://github.com/vuejs/vue-next/issues/1834)
* **runtime-core:** should correctly call `beforeEnter` inside `Suspense` ([#1805](https://github.com/vuejs/vue-next/issues/1805)) ([bc6f252](https://github.com/vuejs/vue-next/commit/bc6f252c4abc72bee29aa4766fc6c5ed0a81d7cd)), closes [#1795](https://github.com/vuejs/vue-next/issues/1795)
* **runtime-core/scheduler:** allow component render functions to trigger itself ([611437a](https://github.com/vuejs/vue-next/commit/611437a3fe5e50a5a6f79e2f8a0ed59e74539626)), closes [#1801](https://github.com/vuejs/vue-next/issues/1801)
* **runtime-core/scheduler:** only allow watch callbacks to be self-triggering ([09702e9](https://github.com/vuejs/vue-next/commit/09702e95b9a3f68fc1952ef74555dffa92d50032)), closes [#1740](https://github.com/vuejs/vue-next/issues/1740) [#1727](https://github.com/vuejs/vue-next/issues/1727)
* **runtime-core/scheduler:** prevent duplicate queue ([#1767](https://github.com/vuejs/vue-next/issues/1767)) ([b2a9142](https://github.com/vuejs/vue-next/commit/b2a91429ede9ea49e4808de2748da19deeb7f335))
* **runtime-core/scheduler:** sort postFlushCbs to ensure refs are set before lifecycle hooks ([#1854](https://github.com/vuejs/vue-next/issues/1854)) ([caccec3](https://github.com/vuejs/vue-next/commit/caccec3f78414ae294f1a813ffd16791d56da3a6)), closes [#1852](https://github.com/vuejs/vue-next/issues/1852)
* **runtime-dom:** fix v-on same computed handler on multiple elements ([1c967fc](https://github.com/vuejs/vue-next/commit/1c967fc44b971686d5a0e2811deb2362ec84979f)), closes [#1747](https://github.com/vuejs/vue-next/issues/1747)
* **runtime-dom:** patch `form` as an attribute ([#1788](https://github.com/vuejs/vue-next/issues/1788)) ([00683fc](https://github.com/vuejs/vue-next/commit/00683fce9a1c6856be23b35ff0226d8ac5c96791)), closes [#1787](https://github.com/vuejs/vue-next/issues/1787)
* **runtime-dom:** style binding multi value support ([0cd98c3](https://github.com/vuejs/vue-next/commit/0cd98c3040a64df4577d188b9f2221224549a132)), closes [#1759](https://github.com/vuejs/vue-next/issues/1759)
* **runtome-core:** do not cache property access in beforeCreate hook ([f6afe70](https://github.com/vuejs/vue-next/commit/f6afe7000efb964355c439b7963087ab8e42d6b1)), closes [#1756](https://github.com/vuejs/vue-next/issues/1756)
* **teleport:** always inherit root DOM nodes on patch ([#1836](https://github.com/vuejs/vue-next/issues/1836)) ([517c2b8](https://github.com/vuejs/vue-next/commit/517c2b8bdb9ffa53717c10d604ff6db84d50d4f2)), closes [#1813](https://github.com/vuejs/vue-next/issues/1813)
* **transition:** transition should accept multiple handlers on same event ([48576e5](https://github.com/vuejs/vue-next/commit/48576e582c4177572c2fd1764fbca53a6a30abe2)), closes [#1746](https://github.com/vuejs/vue-next/issues/1746)
* **types:** handling PropType<Function> with default value ([#1896](https://github.com/vuejs/vue-next/issues/1896)) ([c2913d5](https://github.com/vuejs/vue-next/commit/c2913d57d14449775faf1f2e5647e6d1f3d3f920)), closes [#1891](https://github.com/vuejs/vue-next/issues/1891)
* **types/jsx:** update innerHTML property in jsx typing ([#1814](https://github.com/vuejs/vue-next/issues/1814)) ([b984d47](https://github.com/vuejs/vue-next/commit/b984d47ac43a0aae2db5556a138a256fb5533ced))
* **watch:** allow handler to be a string ([#1775](https://github.com/vuejs/vue-next/issues/1775)) ([b5f91ff](https://github.com/vuejs/vue-next/commit/b5f91ff570244436aa8f579ec3a6fec781d198a7)), closes [#1774](https://github.com/vuejs/vue-next/issues/1774)
* **watch:** exhaust pre-flush watchers + avoid duplicate render by pre-flush watchers ([a0e34ce](https://github.com/vuejs/vue-next/commit/a0e34cee4a09a14548bf1e78f4a82702e9d40717)), closes [#1777](https://github.com/vuejs/vue-next/issues/1777)
* **watch:** pre-flush watcher watching props should trigger before component update ([d4c17fb](https://github.com/vuejs/vue-next/commit/d4c17fb48b7880a4e3db6d48f8ab76540a3f59a2)), closes [#1763](https://github.com/vuejs/vue-next/issues/1763)
* **watch:** should trigger watcher callback on triggerRef when watching ref source ([fce2689](https://github.com/vuejs/vue-next/commit/fce2689ff1af0b632a2034403a6dfbcbff91aa60)), closes [#1736](https://github.com/vuejs/vue-next/issues/1736)


### Features

* **compiler-core:** add `comments` parser option ([#1858](https://github.com/vuejs/vue-next/issues/1858)) ([62b9d02](https://github.com/vuejs/vue-next/commit/62b9d02f6fbb08d51bed73f33435c1ed83d5b2ea))
* **reactivity:** return array when calling `toRefs` on array ([#1768](https://github.com/vuejs/vue-next/issues/1768)) ([4172fdb](https://github.com/vuejs/vue-next/commit/4172fdb90cd75d5741f843a227cfe9b5f5b22b35)), closes [#1764](https://github.com/vuejs/vue-next/issues/1764)
* **runtime-core:** pass current props to prop default value functions ([0d508e9](https://github.com/vuejs/vue-next/commit/0d508e9f51734409ac1aa57ba0ea98808be0a3a3)), closes [#1886](https://github.com/vuejs/vue-next/issues/1886)



# [3.0.0-rc.5](https://github.com/vuejs/vue-next/compare/v3.0.0-rc.4...v3.0.0-rc.5) (2020-07-28)


### Bug Fixes

* **build:** fix component resolution when disabling options API ([a75b8a2](https://github.com/vuejs/vue-next/commit/a75b8a268fca800a49c7d772b4a290b4435e85b9)), closes [#1688](https://github.com/vuejs/vue-next/issues/1688)
* **compiler-core:** always compile Teleport and Suspense as blocks ([fbf865d](https://github.com/vuejs/vue-next/commit/fbf865d9d4744a0233db1ed6e5543b8f3ef51e8d))
* **compiler-core:** prevent generating invalid code for v-bind with empty expression ([#1720](https://github.com/vuejs/vue-next/issues/1720)) ([d452723](https://github.com/vuejs/vue-next/commit/d4527230e40c4728e5becdd35c3e039f0992ae4c))
* **compiler-core/v-on:** only cache empty handler when the option is used ([5fbd1f4](https://github.com/vuejs/vue-next/commit/5fbd1f4ccb22bf62bdf749460f8c6dadee3b6b89)), closes [#1716](https://github.com/vuejs/vue-next/issues/1716)
* **compiler-sfc:** `less` and `stylus` output deps path is absolute p… ([#1685](https://github.com/vuejs/vue-next/issues/1685)) ([578f25c](https://github.com/vuejs/vue-next/commit/578f25c34efab0a71a7afd8bff278bd147a16a64))
* **compiler-sfc:** fix rewrite named export default ([#1675](https://github.com/vuejs/vue-next/issues/1675)) ([452edb7](https://github.com/vuejs/vue-next/commit/452edb73cb02c4aecb518a45df9b01aaa1516b19))
* **hmr:** should update el for `HYDRATE_EVENTS` patchFlags node ([#1707](https://github.com/vuejs/vue-next/issues/1707)) ([de62cc0](https://github.com/vuejs/vue-next/commit/de62cc040c22e3bd93222a9cc84b6564a4b08b51))
* **reactivity:** avoid tracking internal symbols in has trap ([7edfdf7](https://github.com/vuejs/vue-next/commit/7edfdf7e239ef8f58a343f9802d675d84ed51d64)), closes [#1683](https://github.com/vuejs/vue-next/issues/1683)
* **reactivity:** fix ref mutation debugger event values ([b7ef38b](https://github.com/vuejs/vue-next/commit/b7ef38b7731a16b6fa4391978132ee379a1bbdc2))
* **runtime-core:** dev root resolution should differentiate user comments vs v-if comments ([355c052](https://github.com/vuejs/vue-next/commit/355c05262252b247ec29ed4c4fd6ab69143dd6b7)), closes [#1704](https://github.com/vuejs/vue-next/issues/1704)
* **runtime-core:** fix scheduler dedupe when not flushing ([4ef5c8d](https://github.com/vuejs/vue-next/commit/4ef5c8d42408fd444114604292106c0027600fa4))
* **runtime-core:** respect render function from mixins ([354d79c](https://github.com/vuejs/vue-next/commit/354d79c42bf152643b77d83520757818d913de4f)), closes [#1630](https://github.com/vuejs/vue-next/issues/1630)
* **runtime-core:** scheduler should allow intentional self triggering effects ([c27dfe1](https://github.com/vuejs/vue-next/commit/c27dfe1d0994c65de601760d082cf4668dc3fad0)), closes [#1727](https://github.com/vuejs/vue-next/issues/1727)
* **runtime-core:** use correct container for moving `Teleport` content ([#1703](https://github.com/vuejs/vue-next/issues/1703)) ([04a4eba](https://github.com/vuejs/vue-next/commit/04a4ebaaeb4418d211293fc7b92c19c42a425cbd))
* **style-vars:** fix css vars on component with suspense as root ([#1718](https://github.com/vuejs/vue-next/issues/1718)) ([07ece2e](https://github.com/vuejs/vue-next/commit/07ece2e9260fe30a50e7cf317d2ff69f113ecad1))
* **v-model:** enable v-model type detection on custom elements ([0b3b1cf](https://github.com/vuejs/vue-next/commit/0b3b1cfa487a359c8762794cfd74726d55b9ef8f))
* runtime compilation marker should be applied in exposed compile function ([b3b65b4](https://github.com/vuejs/vue-next/commit/b3b65b40582d7fbdc776bfe8a1542b80aebe0aac))
* **transition:** should call transition hooks inside already resolved suspense ([#1698](https://github.com/vuejs/vue-next/issues/1698)) ([2a633c8](https://github.com/vuejs/vue-next/commit/2a633c84ff0e522a7562d3194a8f4e4012eb8281)), closes [#1689](https://github.com/vuejs/vue-next/issues/1689)
* **v-model:** allow v-model usage on declared custom elements ([71c3c6e](https://github.com/vuejs/vue-next/commit/71c3c6e2a03095ddd4c2a1e15957afd3ec8d4120)), closes [#1699](https://github.com/vuejs/vue-next/issues/1699)


### Features

* **reactivity:** `proxyRefs` method and `ShallowUnwrapRefs` type ([#1682](https://github.com/vuejs/vue-next/issues/1682)) ([aa06b10](https://github.com/vuejs/vue-next/commit/aa06b1034d8268fa15cb6b4b6916440701238b2d))
* **sfc:** support resolving template components from `<script setup>` exports ([6f5d840](https://github.com/vuejs/vue-next/commit/6f5d840612dbced2dbb4584c979a8f0cfc1f72f0))
* support delimiters option for runtime compilation ([ba17c87](https://github.com/vuejs/vue-next/commit/ba17c871d80f833e064a51900d07efa358eafb89)), closes [#1679](https://github.com/vuejs/vue-next/issues/1679)


### BREAKING CHANGES

* **reactivity:** template auto ref unwrapping are now applied shallowly,
i.e. only at the root level. See https://github.com/vuejs/vue-next/pull/1682 for
more details.



# [3.0.0-rc.4](https://github.com/vuejs/vue-next/compare/v3.0.0-rc.3...v3.0.0-rc.4) (2020-07-21)


### Bug Fixes

* **deps:** move @babel/types back to dependencies ([11c2ad4](https://github.com/vuejs/vue-next/commit/11c2ad4a04c000ea828a0f5017e41fc7e0816868))



# [3.0.0-rc.3](https://github.com/vuejs/vue-next/compare/v3.0.0-rc.2...v3.0.0-rc.3) (2020-07-21)


### Bug Fixes

* **build:** make transition tree-shakeable again ([ad199e1](https://github.com/vuejs/vue-next/commit/ad199e1a252f80c85a8e40a4b4539ad27c39505c))
* **compiler-sfc:** `<style vars scoped>` prefixing should only apply to pre-transform source ([4951d43](https://github.com/vuejs/vue-next/commit/4951d4352605eb9f4bcbea40ecc68fc6cbc3dce2)), closes [#1623](https://github.com/vuejs/vue-next/issues/1623)
* **compiler-sfc:** use correct importer with `useCssVars` ([#1658](https://github.com/vuejs/vue-next/issues/1658)) ([6f148d0](https://github.com/vuejs/vue-next/commit/6f148d0b9a0630dc87c741ed951c82b639e776b2))
* **runtime-core:** do not use bail patchFlag on cloned vnodes ([6390ddf](https://github.com/vuejs/vue-next/commit/6390ddfb7d0ed83ac4bae15d0497cba4de3e1972)), closes [#1665](https://github.com/vuejs/vue-next/issues/1665)
* **runtime-core:** fix attr fallthrough on compiled framgent w/ single static element + comments ([1af3531](https://github.com/vuejs/vue-next/commit/1af35317195772ea8f2728abc8f5ac159a5b7b75))
* **v-model:** v-model listeners should not fallthrough to plain element root ([c852bf1](https://github.com/vuejs/vue-next/commit/c852bf18d7a51be0c3255357f0c30f39ae9bb540)), closes [#1643](https://github.com/vuejs/vue-next/issues/1643)
* **watch:** fix watching reactive array ([#1656](https://github.com/vuejs/vue-next/issues/1656)) ([288b4ea](https://github.com/vuejs/vue-next/commit/288b4eab9e10187eb14d4d6d54dc9f077343a2a5)), closes [#1655](https://github.com/vuejs/vue-next/issues/1655)


### Features

* **compiler-core/internal:** add `onContextCreated` option to `generate` ([#1672](https://github.com/vuejs/vue-next/issues/1672)) ([615dccd](https://github.com/vuejs/vue-next/commit/615dccd00e7d85a3f4b82e62d6cb6c41f167d8c6))
* **runtime-core:** respect function name when using `defineComponent` function shorthand ([#1661](https://github.com/vuejs/vue-next/issues/1661)) ([304830a](https://github.com/vuejs/vue-next/commit/304830a764cd9f28098cfb0ac0e520e1bb2f57c7))
* provide ability to overwrite feature flags in esm-bundler builds ([54727f9](https://github.com/vuejs/vue-next/commit/54727f9874abe8d0c99ee153d252269ae519b45d))
* **computed:** add readonly flag if no setter is provided ([#1654](https://github.com/vuejs/vue-next/issues/1654)) ([dabdc5e](https://github.com/vuejs/vue-next/commit/dabdc5e115514f98b5f8559a3819e96416939f43))



# [3.0.0-rc.2](https://github.com/vuejs/vue-next/compare/v3.0.0-rc.1...v3.0.0-rc.2) (2020-07-19)


### Bug Fixes

* **compiler-core:** fix v-if + v-for on `<template>` ([af7e100](https://github.com/vuejs/vue-next/commit/af7e100ef229e1088abfd270a71c5a7da44e760e)), closes [#1637](https://github.com/vuejs/vue-next/issues/1637)
* **compiler-core/v-on:** fix codegen for event handler with newlines ([#1640](https://github.com/vuejs/vue-next/issues/1640)) ([f9826fa](https://github.com/vuejs/vue-next/commit/f9826fa963e67c495b8c44efb22b09b87df381de))
* **compiler-sfc:** use `filename` from options when compile styl preprocessor ([#1635](https://github.com/vuejs/vue-next/issues/1635)) ([0526e5d](https://github.com/vuejs/vue-next/commit/0526e5d7faa9ba69f76e7ff71fe96d93a4e99684))
* **keep-alive:**  handle "0" as cache key ([#1622](https://github.com/vuejs/vue-next/issues/1622)) ([2deb0c7](https://github.com/vuejs/vue-next/commit/2deb0c7a74d20e334bb1458bc2f28d65aeea704b)), closes [#1621](https://github.com/vuejs/vue-next/issues/1621)
* **runtime-core/hmr:** only use cloneNode mount optimization in prod ([4655d69](https://github.com/vuejs/vue-next/commit/4655d699831b3356bb8be5b41c45da830dac9eb2)), closes [#1626](https://github.com/vuejs/vue-next/issues/1626)
* **watch:** callback not called when using `flush:sync` ([#1633](https://github.com/vuejs/vue-next/issues/1633)) ([8facaef](https://github.com/vuejs/vue-next/commit/8facaefcc3eff1ca1fa19832172495e4272979e5))



# [3.0.0-rc.1](https://github.com/vuejs/vue-next/compare/v3.0.0-beta.24...v3.0.0-rc.1) (2020-07-17)


### Bug Fixes

* **watch:** post flush watchers should not fire when component is unmounted ([341b30c](https://github.com/vuejs/vue-next/commit/341b30c961aa065fc59f0c2b592a11229cb6bd14)), closes [#1603](https://github.com/vuejs/vue-next/issues/1603)


### Features

* **types:** deny unknown attributes on component by default ([#1614](https://github.com/vuejs/vue-next/issues/1614)) ([5d8a64d](https://github.com/vuejs/vue-next/commit/5d8a64d53a27ad57fe9940dd0d4d745dfbaf3c9e)), closes [#1519](https://github.com/vuejs/vue-next/issues/1519)
* **types:** expose `DeepReadonly` type ([#1606](https://github.com/vuejs/vue-next/issues/1606)) ([527c2c8](https://github.com/vuejs/vue-next/commit/527c2c8bbb5c8fcfdf827dd985a09d7e7388cdad))
* Initial devtools support ([#1125](https://github.com/vuejs/vue-next/issues/1125)) ([568b6db](https://github.com/vuejs/vue-next/commit/568b6db12b9fa167569809dc0da7e0e3c026f204))



# [3.0.0-beta.24](https://github.com/vuejs/vue-next/compare/v3.0.0-beta.23...v3.0.0-beta.24) (2020-07-16)


### Bug Fixes

* **compiler-sfc:** fix preprocessor filename access ([9cb29ee](https://github.com/vuejs/vue-next/commit/9cb29eea3a61f7f4a6730fed56f2e3e9a13dbcc9))



# [3.0.0-beta.23](https://github.com/vuejs/vue-next/compare/v3.0.0-beta.22...v3.0.0-beta.23) (2020-07-16)


### Bug Fixes

* **compiler-sfc:** fix `useCssVars` codegen ([9b5ff2b](https://github.com/vuejs/vue-next/commit/9b5ff2b567f5e29cc59e23e106f2278c3feaad21))
* **compiler-sfc:** prohibit src usage for `<script setup>` + do not ([af4b0c2](https://github.com/vuejs/vue-next/commit/af4b0c2cf18b63990bc266eb0871a50ba2004fc0))
* **runtime-dom:** unref when setting `useCssVars` ([44e6da1](https://github.com/vuejs/vue-next/commit/44e6da1402fa2b6f5a0a0c692cd693a8ff1a40a3))
* **slots:** properly force update on forwarded slots ([aab99ab](https://github.com/vuejs/vue-next/commit/aab99abd28a5d17f2d1966678b0d334975d21877)), closes [#1594](https://github.com/vuejs/vue-next/issues/1594)


### Features

* **compiler-sfc:** export dependencies for css and css preprocessors ([#1278](https://github.com/vuejs/vue-next/issues/1278)) ([e41d831](https://github.com/vuejs/vue-next/commit/e41d8310de0d9299fce2bccd57af4e30b74e3795))


### Performance Improvements

* **runtime-core:** avoid duplicate `postFlushCb` invocation ([165068d](https://github.com/vuejs/vue-next/commit/165068dbc295bb70fdec9ae56dfcaac17d2f977c)), closes [#1595](https://github.com/vuejs/vue-next/issues/1595)



# [3.0.0-beta.22](https://github.com/vuejs/vue-next/compare/v3.0.0-beta.21...v3.0.0-beta.22) (2020-07-15)


### Bug Fixes

* **compiler-core:** generate incremental keys for `v-if/else-if/else` chains ([#1589](https://github.com/vuejs/vue-next/issues/1589)) ([64c7b2f](https://github.com/vuejs/vue-next/commit/64c7b2f9cedae676ec26a7a8da4c109bc88b48f1)), closes [#1587](https://github.com/vuejs/vue-next/issues/1587)
* **compiler-sfc:** `<script setup>` warning ([9146cc4](https://github.com/vuejs/vue-next/commit/9146cc485e317ff29192796f9366471144ed3ad2))
* **hmr:** fix hmr updates for reused hoisted trees ([5f61aa0](https://github.com/vuejs/vue-next/commit/5f61aa0f719cbd90182af1e27fad37b91c2c351e))
* **runtime-core:** do not call transition enter hooks when mounting in suspense ([#1588](https://github.com/vuejs/vue-next/issues/1588)) ([246ec5c](https://github.com/vuejs/vue-next/commit/246ec5c594650f3fcccd0de94aa3f97b4d705e42)), closes [#1583](https://github.com/vuejs/vue-next/issues/1583)
* **v-model:** handle more edge cases in `looseEqual()` ([#379](https://github.com/vuejs/vue-next/issues/379)) ([fe1b27b](https://github.com/vuejs/vue-next/commit/fe1b27b7f875e1c8aece12b04531e7fa3184be27))


### Features

* **types/reactivity:** use `DeepReadonly` type for `readonly` return type ([#1462](https://github.com/vuejs/vue-next/issues/1462)) ([b772bba](https://github.com/vuejs/vue-next/commit/b772bba5587726e78b20ccb9b61374120bd4b0ae)), closes [#1452](https://github.com/vuejs/vue-next/issues/1452)



# [3.0.0-beta.21](https://github.com/vuejs/vue-next/compare/v3.0.0-beta.20...v3.0.0-beta.21) (2020-07-14)


### Bug Fixes

* **compiler-dom:** fix v-on `.left` `.right` modifier handling ([6b63ba2](https://github.com/vuejs/vue-next/commit/6b63ba2f453b3f9bbf9e9e2167030de42f76b5ac))
* **runtime-core:** avoid `scopeId` as attr for slot nodes with same `scopeId` ([#1561](https://github.com/vuejs/vue-next/issues/1561)) ([583a1c7](https://github.com/vuejs/vue-next/commit/583a1c7b45e67e9cd57e411853c20509248def89)), closes [vitejs/vite#536](https://github.com/vitejs/vite/issues/536)
* **runtime-core/emits:** merge emits options from mixins/extends ([ba3b3cd](https://github.com/vuejs/vue-next/commit/ba3b3cdda98f6efb5d4c4fafc579b8f568a19bde)), closes [#1562](https://github.com/vuejs/vue-next/issues/1562)
* **runtime-dom:** remove attrs with nullish values ([cb6a091](https://github.com/vuejs/vue-next/commit/cb6a0915c540af94f5d79c311022b99bc17f2965)), closes [#1576](https://github.com/vuejs/vue-next/issues/1576)
* **runtime-dom/v-on:** only block event handlers based on attach timestamp ([8b320cc](https://github.com/vuejs/vue-next/commit/8b320cc12f74aafea9ec69f7ce70231d4f0d08fd)), closes [#1565](https://github.com/vuejs/vue-next/issues/1565)
* **slots:** differentiate dynamic/static compiled slots ([65beba9](https://github.com/vuejs/vue-next/commit/65beba98fe5793133d3218945218b9e3f8d136eb)), closes [#1557](https://github.com/vuejs/vue-next/issues/1557)
* **v-on:** capitalize dynamic event names ([9152a89](https://github.com/vuejs/vue-next/commit/9152a8901653d7cef864a52a3c618afcc70d827d))
* **v-on:** refactor DOM event options modifer handling ([380c679](https://github.com/vuejs/vue-next/commit/380c6792d8899f1a43a9e6400c5df483c63290b6)), closes [#1567](https://github.com/vuejs/vue-next/issues/1567)


### Features

* ssr support for `<style vars>` ([b9595e6](https://github.com/vuejs/vue-next/commit/b9595e64cfdfc2607d3d3e6232b4a7ea199dd553))
* **compiler-sfc:** `<script setup>` support (experimental) ([4c43d4e](https://github.com/vuejs/vue-next/commit/4c43d4e5b9df8732b601a269bf4030f9721d466f))
* **compiler-sfc:** `<style vars>` CSS variable injection ([bd5c3b9](https://github.com/vuejs/vue-next/commit/bd5c3b96be2c6c4a0b84b096c3baa3c30feb95d6))
* **compiler-sfc:** allow using :deep, :global & :slotted for short in `<style scoped>` ([f3cc41f](https://github.com/vuejs/vue-next/commit/f3cc41f0c8713475f2aa592bae3d82ffbc6b1300))
* **runtime-dom:** useCssVars ([9f706a9](https://github.com/vuejs/vue-next/commit/9f706a9f5ee52c8256c52111da4271bf43b811ab))



# [3.0.0-beta.20](https://github.com/vuejs/vue-next/compare/v3.0.0-beta.19...v3.0.0-beta.20) (2020-07-08)


### Bug Fixes

* **compiler-core/v-on:** bail caching for member expression handlers on components ([87c2a1e](https://github.com/vuejs/vue-next/commit/87c2a1e50f5317a0c47051b06f419e60e5644a1a)), closes [#1541](https://github.com/vuejs/vue-next/issues/1541)
* **compiler-dom:** should ignore and warn side effect tags like script and style ([5e52f4e](https://github.com/vuejs/vue-next/commit/5e52f4e4d7c92ee8ec9c0d644735e23342965096))
* **runtime-core:** should allow v-model listeners to fallthrough, but ignore for warning ([903e8f6](https://github.com/vuejs/vue-next/commit/903e8f697e4377e0ae92e1a6b58777438fba3610)), closes [#1543](https://github.com/vuejs/vue-next/issues/1543)


### Features

* **types:** expose `WritableComputedRef` ([#1500](https://github.com/vuejs/vue-next/issues/1500)) ([220db9b](https://github.com/vuejs/vue-next/commit/220db9bcda17a56bb4e5222d2634800672513983))



# [3.0.0-beta.19](https://github.com/vuejs/vue-next/compare/v3.0.0-beta.18...v3.0.0-beta.19) (2020-07-07)


### Bug Fixes

* **compiler-core:** add `\r` to accepted chars after end tag name ([#1515](https://github.com/vuejs/vue-next/issues/1515)) ([64e2f46](https://github.com/vuejs/vue-next/commit/64e2f4643602c5980361e66674141e61ba60ef70)), closes [#1476](https://github.com/vuejs/vue-next/issues/1476)
* **keep-alive:** fix keep-alive with scopeId/fallthrough attrs ([d86b01b](https://github.com/vuejs/vue-next/commit/d86b01ba3a29e2e04c13597a1b9123ca35beaf57)), closes [#1511](https://github.com/vuejs/vue-next/issues/1511)
* **runtime-core/template-ref:** template ref used in the same template should trigger update ([36b6b4f](https://github.com/vuejs/vue-next/commit/36b6b4f0228c4adf679c232bf4d1e8cff7fb6474)), closes [#1505](https://github.com/vuejs/vue-next/issues/1505)
* **runtime-dom:** should set `<input list="...">` as attribute ([441c236](https://github.com/vuejs/vue-next/commit/441c23602f57d00b00fa3a590b30487003efe210)), closes [#1526](https://github.com/vuejs/vue-next/issues/1526)
* **runtime-dom/style:** fix `patchStyle` on falsy next value ([#1504](https://github.com/vuejs/vue-next/issues/1504)) ([77538ec](https://github.com/vuejs/vue-next/commit/77538ec6d90fee66d229d6d3a4f977c6b548a9bd)), closes [#1506](https://github.com/vuejs/vue-next/issues/1506)
* **ssr:** support dynamic components that resolve to element or vnode ([41db49d](https://github.com/vuejs/vue-next/commit/41db49dfb7c520c4f743e522a03f06b33259a2eb)), closes [#1508](https://github.com/vuejs/vue-next/issues/1508)
* **types/tsx:** add `JSX.IntrinsicAttributes` definition ([#1517](https://github.com/vuejs/vue-next/issues/1517)) ([a5b4332](https://github.com/vuejs/vue-next/commit/a5b4332c69146de569ad328cac9224c3cded15c9)), closes [#1516](https://github.com/vuejs/vue-next/issues/1516)
* **v-model:** consistent nullish value handling with 2.x ([#1530](https://github.com/vuejs/vue-next/issues/1530)) ([425335c](https://github.com/vuejs/vue-next/commit/425335c28bdb48f2f48f97021fc0a77eaa89ec34)), closes [#1528](https://github.com/vuejs/vue-next/issues/1528)
* **v-model:** should ignore compiled v-model listeners in attr fallthrough ([6dd59ee](https://github.com/vuejs/vue-next/commit/6dd59ee301d8d93e7ca14447243d07a653e69159)), closes [#1510](https://github.com/vuejs/vue-next/issues/1510)
* **watch:** stop instance-bound watchers in post render queue ([58b0706](https://github.com/vuejs/vue-next/commit/58b07069ad33c8a8e44cb47b81084a452dda2846)), closes [#1525](https://github.com/vuejs/vue-next/issues/1525)



# [3.0.0-beta.18](https://github.com/vuejs/vue-next/compare/v3.0.0-beta.16...v3.0.0-beta.18) (2020-07-02)


### Bug Fixes

* **runtime-core:** avoid accidental access of `Object.prototype` properties ([f3e9c1b](https://github.com/vuejs/vue-next/commit/f3e9c1b59d5d3999ac6180ed75c84d88b29c41e6))
* ensure vnode hooks are called consistently regardless of keep-alive ([4e8e689](https://github.com/vuejs/vue-next/commit/4e8e689572dcae0cb468989c5e0c531a837a900b))
* **runtime-core:** pass unmount into initial mount patch prop ([2bdb5c1](https://github.com/vuejs/vue-next/commit/2bdb5c146449092623f06e20fb71ebaca7e5588f))
* **runtime-dom:** allow force updating value bindings for controlled inputs ([b3536d8](https://github.com/vuejs/vue-next/commit/b3536d87a587dc1e78c8712cb29ca61ca0931ac9)), closes [#1471](https://github.com/vuejs/vue-next/issues/1471)
* **slots:** make compiled slot marker non-enumerable ([062835d](https://github.com/vuejs/vue-next/commit/062835d45aaf4168ddf2e39a5c7e162b3a18ccae)), closes [#1470](https://github.com/vuejs/vue-next/issues/1470)


### Features

* **runtime-core:** support creating vnode from existing vnode ([c9629f2](https://github.com/vuejs/vue-next/commit/c9629f26924fcb3c51994549a3013ccc05c1030a))



# [3.0.0-beta.17](https://github.com/vuejs/vue-next/compare/v3.0.0-beta.16...v3.0.0-beta.17) (2020-06-30)


### Bug Fixes

* **runtime-dom:** allow force updating value bindings for controlled inputs ([b3536d8](https://github.com/vuejs/vue-next/commit/b3536d87a587dc1e78c8712cb29ca61ca0931ac9)), closes [#1471](https://github.com/vuejs/vue-next/issues/1471)
* **slots:** make compiled slot marker non-enumerable ([062835d](https://github.com/vuejs/vue-next/commit/062835d45aaf4168ddf2e39a5c7e162b3a18ccae)), closes [#1470](https://github.com/vuejs/vue-next/issues/1470)



# [3.0.0-beta.16](https://github.com/vuejs/vue-next/compare/v3.0.0-beta.15...v3.0.0-beta.16) (2020-06-29)


### Bug Fixes

* **BaseTransition:** collect correct children with slot passthrough in `Transition` ([#1456](https://github.com/vuejs/vue-next/issues/1456)) ([d4cd128](https://github.com/vuejs/vue-next/commit/d4cd12887eba18c4aff02b85834679bfe679f878)), closes [#1455](https://github.com/vuejs/vue-next/issues/1455)
* **BaseTransition:** fix `BaseTransition` delayed leave with mode `in-out` ([#1404](https://github.com/vuejs/vue-next/issues/1404)) ([2ff8dca](https://github.com/vuejs/vue-next/commit/2ff8dcab0a51cc3634a0a739641fb4cfe459b731)), closes [#1400](https://github.com/vuejs/vue-next/issues/1400)
* **compiler-core:** ignore comment nodes in transition children ([e52b7cd](https://github.com/vuejs/vue-next/commit/e52b7cd7e7c10d8dbad92000ab3d5f2e02533e39)), closes [#1352](https://github.com/vuejs/vue-next/issues/1352)
* **compiler-core:** should not prefix object method ([#1375](https://github.com/vuejs/vue-next/issues/1375)) ([35dbef2](https://github.com/vuejs/vue-next/commit/35dbef268ca43234aa8544a62dfa4240dcc2974e))
* **compiler-core:** skip empty expressions when validating expressions in browser mode ([afb231e](https://github.com/vuejs/vue-next/commit/afb231ec5ce5ac77ff6260bea4d866ec2d5bbd85))
* **compiler-core/v-on:** pass noninitial arguments in cached event handlers ([#1265](https://github.com/vuejs/vue-next/issues/1265)) ([7e28173](https://github.com/vuejs/vue-next/commit/7e281733120fe003552b915f97713a3d26f4dc8a))
* **compiler-sfc:** `transformAssetUrl` should ignore inline data url ([#1431](https://github.com/vuejs/vue-next/issues/1431)) ([90c285c](https://github.com/vuejs/vue-next/commit/90c285c5c8ac13afb4932974c1f9aede15e81337))
* **runtime-core:** always check props presence in public instance proxy ([e0d19a6](https://github.com/vuejs/vue-next/commit/e0d19a695316a8a459274874d304872fea384851)), closes [#1236](https://github.com/vuejs/vue-next/issues/1236)
* **runtime-core:** `cloneVNode` should preserve correct ctx instance when normalizing ref ([be69bee](https://github.com/vuejs/vue-next/commit/be69beed5ed05067006c297589598b33e7108b1b)), closes [#1311](https://github.com/vuejs/vue-next/issues/1311)
* **runtime-core:** component root should inherit `scopeId` from `VNode` ([f3f94e4](https://github.com/vuejs/vue-next/commit/f3f94e4deb40d3a0d83804454874833b194f83da)), closes [#1399](https://github.com/vuejs/vue-next/issues/1399)
* **runtime-core:** fix component name inference in warnings ([e765d81](https://github.com/vuejs/vue-next/commit/e765d814048c2cdc3cc32bdffb73c6e59b0d747d)), closes [#1418](https://github.com/vuejs/vue-next/issues/1418)
* **runtime-core:** fix parent el update on nested HOC self-update ([#1360](https://github.com/vuejs/vue-next/issues/1360)) ([6c8bfa1](https://github.com/vuejs/vue-next/commit/6c8bfa10189d1a5a6837d2e25a9451889a0e19d6)), closes [#1357](https://github.com/vuejs/vue-next/issues/1357)
* **runtime-core:** fix `scopeId` inheritance for component inside slots ([978d952](https://github.com/vuejs/vue-next/commit/978d9522e80cb19257ee2f4c8ba5da6f8aa6b3d2))
* **runtime-core:** handle patch flag de-op from cloned vnode ([0dd5cde](https://github.com/vuejs/vue-next/commit/0dd5cde861735e80cfe21537380e52789cc865f8)), closes [#1426](https://github.com/vuejs/vue-next/issues/1426)
* **runtime-core:** properly capitalize v-on object keys ([#1358](https://github.com/vuejs/vue-next/issues/1358)) ([250eb4a](https://github.com/vuejs/vue-next/commit/250eb4a5bc121d303aa109c20251c95616049f05))
* **runtime-core:** should remove no longer present camelCase props ([#1413](https://github.com/vuejs/vue-next/issues/1413)) ([1c4e1b6](https://github.com/vuejs/vue-next/commit/1c4e1b679261ad151c4ed04b11279a3768a1c9e2)), closes [#1412](https://github.com/vuejs/vue-next/issues/1412)
* **slots:** filter out compiler marker from resolved slots ([70ea76a](https://github.com/vuejs/vue-next/commit/70ea76ae0c16a55154e785f8ca42ed13e0d15170)), closes [#1451](https://github.com/vuejs/vue-next/issues/1451)
* **ssr:** fix ssr scopeId on component root ([afe13e0](https://github.com/vuejs/vue-next/commit/afe13e0584afb70a2682763dda148c35f9a97f95))
* **ssr:** handle fallthrough attrs in ssr compile output ([d5dbd27](https://github.com/vuejs/vue-next/commit/d5dbd27193eee5fe401d3b85b6c5ddef5cd42b9d))
* **transition:** enter/leave hook timing consistency with v2 ([bf84ac8](https://github.com/vuejs/vue-next/commit/bf84ac8396666194cd386b8a66040b19131983e0)), closes [#1145](https://github.com/vuejs/vue-next/issues/1145)
* **transition:** fix appear hooks handling ([7ae70ea](https://github.com/vuejs/vue-next/commit/7ae70ea44cf66be134c6ec3b060d9872fa0774e0))
* **transition:** fix css:false with hooks with no explicit done callback ([9edbc27](https://github.com/vuejs/vue-next/commit/9edbc27f45aafaa6bc27ab244dc77d4d86d09fc4)), closes [#1149](https://github.com/vuejs/vue-next/issues/1149)
* **transition:** fix dom transition cancel hooks not being called ([acd3156](https://github.com/vuejs/vue-next/commit/acd3156d2c45609ab04cb54734258fe340c4ca02))
* **transition-group:** vue 2 compatible handling of transition-group w/ multiple v-for children ([86d3972](https://github.com/vuejs/vue-next/commit/86d3972855990c23f583a4b11b3c86fe04f1ab90)), closes [#1126](https://github.com/vuejs/vue-next/issues/1126)
* **types:** ensure correct public props interface for `defineComponent` instance type ([2961e14](https://github.com/vuejs/vue-next/commit/2961e149c9825d56680e982acd056d9f337afc5e)), closes [#1385](https://github.com/vuejs/vue-next/issues/1385)
* **types:** export `ComponentOptionsMixin` ([#1361](https://github.com/vuejs/vue-next/issues/1361)) ([68e2d6c](https://github.com/vuejs/vue-next/commit/68e2d6c68a4e8a95d112597b82d40efb8571d9c0))
* **types:** should unwrap array -> object -> ref ([82b28a5](https://github.com/vuejs/vue-next/commit/82b28a5ecb95be1565e50427bfd5eefe4b2d408c))
* **v-show:** fix v-show unmount with falsy value ([#1403](https://github.com/vuejs/vue-next/issues/1403)) ([d7beea0](https://github.com/vuejs/vue-next/commit/d7beea015bdb208d89a2352a5d43cc1913f87337)), closes [#1401](https://github.com/vuejs/vue-next/issues/1401)


### Features

* **runtime-core:** expose version on app instance ([056cac9](https://github.com/vuejs/vue-next/commit/056cac91855e644e94cd704ff5462c4e1acba66b)), closes [#1449](https://github.com/vuejs/vue-next/issues/1449)
* **ssr:** `renderToStream` ([#1197](https://github.com/vuejs/vue-next/issues/1197)) ([6bc0e0a](https://github.com/vuejs/vue-next/commit/6bc0e0a31a173cfd4cef82230862f269e4d94c94))


### Performance Improvements

* **compiler-core:** treat v-for with constant exp as a stable fragment ([#1394](https://github.com/vuejs/vue-next/issues/1394)) ([8a2cf21](https://github.com/vuejs/vue-next/commit/8a2cf21b717411e4e66f9223e9f6d1c5c817c6ac))
* **reactivity:** should not track `__v_isRef` ([#1392](https://github.com/vuejs/vue-next/issues/1392)) ([c43a6e6](https://github.com/vuejs/vue-next/commit/c43a6e61a0952c629cfb062f67e8eb27a0f6f227))
* **ssr:** avoid unnecessary await ticks when unrolling sync buffers ([30584bc](https://github.com/vuejs/vue-next/commit/30584bcc61515eb9200071b8a4780e05c2ab786e))



# [3.0.0-beta.15](https://github.com/vuejs/vue-next/compare/v3.0.0-beta.14...v3.0.0-beta.15) (2020-06-12)


### Bug Fixes

* **build:** retain main vue package side effect for compiler registration ([dc986ad](https://github.com/vuejs/vue-next/commit/dc986addd9f6c57a4d3d13b0f97132064a8d76a4)), closes [#1263](https://github.com/vuejs/vue-next/issues/1263)
* **compiler-core:** allow multiline expression on v-model and v-on ([#1234](https://github.com/vuejs/vue-next/issues/1234)) ([958b6c8](https://github.com/vuejs/vue-next/commit/958b6c80cf2e07ef6e829b5b5d698fd61c25b91f))
* **compiler-core:** bail static stringfication even threshold is met ([#1298](https://github.com/vuejs/vue-next/issues/1298)) ([64ec8bf](https://github.com/vuejs/vue-next/commit/64ec8bfb54b97036d9cde765d923443ec8bc02b9)), closes [#1128](https://github.com/vuejs/vue-next/issues/1128)
* **compiler-core:** fix parsing for directive with dynamic argument containing dots ([0d26413](https://github.com/vuejs/vue-next/commit/0d26413433d41389f5525a0ef2c2dd7cfbb454d4))
* **compiler-core:** support static slot names containing dots for 2.x compat ([825ec15](https://github.com/vuejs/vue-next/commit/825ec1500feda8b0c43245e7e92074af7f9dcca2)), closes [#1241](https://github.com/vuejs/vue-next/issues/1241)
* **hmr:** force full update on nested child components ([#1312](https://github.com/vuejs/vue-next/issues/1312)) ([8f2a748](https://github.com/vuejs/vue-next/commit/8f2a7489b7c74f5cfc1844697c60287c37fc0eb8))
* **reactivity:** fix toRaw for objects prototype inherting reactive ([10bb34b](https://github.com/vuejs/vue-next/commit/10bb34bb869a47c37d945f8c80abf723fac9fc1a)), closes [#1246](https://github.com/vuejs/vue-next/issues/1246)
* **runtime-core:** should pass instance to patchProp on mount for event error handling ([#1337](https://github.com/vuejs/vue-next/issues/1337)) ([aac9b03](https://github.com/vuejs/vue-next/commit/aac9b03c11c9be0c67b924004364a42d04d78195)), closes [#1336](https://github.com/vuejs/vue-next/issues/1336)
* **runtime-core:** track access to $attrs ([6abac87](https://github.com/vuejs/vue-next/commit/6abac87b3d1b7a22df80b7a70a10101a7f3d3732)), closes [#1346](https://github.com/vuejs/vue-next/issues/1346)
* always treat spellcheck and draggable as attributes ([4492b88](https://github.com/vuejs/vue-next/commit/4492b88938922a7f1bcc36a608375ad99f16b22e)), closes [#1350](https://github.com/vuejs/vue-next/issues/1350)
* **compiler-core:** fix prod whitespace/comment removal ([f3623e4](https://github.com/vuejs/vue-next/commit/f3623e4d1ea83d552b5ab29955dead6c36a87723)), closes [#1256](https://github.com/vuejs/vue-next/issues/1256)
* **compiler-dom:** add tfoot,caption,col element on bail stringification ([#1333](https://github.com/vuejs/vue-next/issues/1333)) ([fbaf52a](https://github.com/vuejs/vue-next/commit/fbaf52ae9fdd412e517e7edf44544db5d759dd2c))
* **compiler-dom:** bail stringification on table elements ([a938b61](https://github.com/vuejs/vue-next/commit/a938b61edca63c1f03f99b85de3f2a3a519268e6)), closes [#1230](https://github.com/vuejs/vue-next/issues/1230) [#1268](https://github.com/vuejs/vue-next/issues/1268)
* **compiler-sfc:** asset url transform should ignore direct hash urls ([5ddd9d2](https://github.com/vuejs/vue-next/commit/5ddd9d241747ef785de848d19246ef518abd8b8f))
* **compiler-ssr:** should escape template string interpolation chars in generated code ([5f15d9a](https://github.com/vuejs/vue-next/commit/5f15d9aa4b9024b3764b962bee042d72f94dee91))
* **hmr:** force full update in child component on slot update ([2408a65](https://github.com/vuejs/vue-next/commit/2408a656627358b21aa49209e64d14a1aeec7825))
* **reactivity:** replaced ref in reactive object should be tracked ([#1058](https://github.com/vuejs/vue-next/issues/1058)) ([80e1693](https://github.com/vuejs/vue-next/commit/80e1693e1f525a6c5811689fbeaccdccae1e2c23))
* **reactivity:** shallowReactive collection to not-readonly ([#1212](https://github.com/vuejs/vue-next/issues/1212)) ([c97d1ba](https://github.com/vuejs/vue-next/commit/c97d1bae56c3643304165d0e5b7924e5a0aad2df))
* **runtime-core:** default value for function type prop ([#1349](https://github.com/vuejs/vue-next/issues/1349)) ([d437a01](https://github.com/vuejs/vue-next/commit/d437a0145df5b63a959da873041816af68b440db)), closes [#1348](https://github.com/vuejs/vue-next/issues/1348)
* **runtime-core:** mount children before setting element props ([8084156](https://github.com/vuejs/vue-next/commit/8084156f4d0b572716a685a561d5087cddceab2c)), closes [#1318](https://github.com/vuejs/vue-next/issues/1318) [#1320](https://github.com/vuejs/vue-next/issues/1320)
* **runtime-core:** respect props from mixins and extends ([2417a0c](https://github.com/vuejs/vue-next/commit/2417a0cb302ed72e145986f85422470713edf2d8)), closes [#1236](https://github.com/vuejs/vue-next/issues/1236) [#1250](https://github.com/vuejs/vue-next/issues/1250)
* **runtime-core:** use array destructuring instead of object for edge compat ([#1302](https://github.com/vuejs/vue-next/issues/1302)) ([4a5021e](https://github.com/vuejs/vue-next/commit/4a5021e763b7f49069e1f3d488bdddf910f09f3f)), closes [#1294](https://github.com/vuejs/vue-next/issues/1294)
* **runtime-dom:** compatibility for cases where event.timeStamp is 0 ([#1328](https://github.com/vuejs/vue-next/issues/1328)) ([90c3532](https://github.com/vuejs/vue-next/commit/90c35329468e1fbb5cd2c1df2e4efd5b12b4fd41)), closes [#1325](https://github.com/vuejs/vue-next/issues/1325)
* **ssr:** fix unintended error on `Teleport` hydration mismatch ([#1271](https://github.com/vuejs/vue-next/issues/1271)) ([c463a71](https://github.com/vuejs/vue-next/commit/c463a71bb31f01da55927424533e2ece3a3c4efe)), closes [#1235](https://github.com/vuejs/vue-next/issues/1235)
* **types:** add RawSlots in h signature ([#1293](https://github.com/vuejs/vue-next/issues/1293)) ([cab769f](https://github.com/vuejs/vue-next/commit/cab769f174f4c0bcad59454e4a77039830e796f8))
* bail stringification for slots ([9b5d13e](https://github.com/vuejs/vue-next/commit/9b5d13e598686b0a73bc8f4a0f5581f066c3e923)), closes [#1281](https://github.com/vuejs/vue-next/issues/1281) [#1286](https://github.com/vuejs/vue-next/issues/1286)
* **ssr:** should set ref on hydration ([0a7932c](https://github.com/vuejs/vue-next/commit/0a7932c6b3e6b6fdda27fa7161726a615a598355))
* run ci ([6b889e7](https://github.com/vuejs/vue-next/commit/6b889e7c8a599c829f9a240fdcdce3299fbd0e6d))


### Features

* **compiler:** better warning for invalid expressions in function/browser mode ([e29f0b3](https://github.com/vuejs/vue-next/commit/e29f0b3fc2b10c76264cdd8e49c2ab4260286fd6)), closes [#1266](https://github.com/vuejs/vue-next/issues/1266)
* **runtime-core:** add inheritRef option + make `<transition>` & `<keep-alive>` inherit refs ([38f2d23](https://github.com/vuejs/vue-next/commit/38f2d23a607cd7077da189ac274a3a0ad542cc1f))
* **types:** adjust type exports for manual render function and tooling usage ([e4dc03a](https://github.com/vuejs/vue-next/commit/e4dc03a8b17d5e9f167de6a62a645878ac7ef3e2)), closes [#1329](https://github.com/vuejs/vue-next/issues/1329)
* **types:** mixins/extends support in TypeScript ([#626](https://github.com/vuejs/vue-next/issues/626)) ([d3c436a](https://github.com/vuejs/vue-next/commit/d3c436ae2e66b75b7f2ed574dadda3f0e1fdce73))
* **types:** support typing directive value via generic argument ([#1007](https://github.com/vuejs/vue-next/issues/1007)) ([419b86d](https://github.com/vuejs/vue-next/commit/419b86d1908f2a0521e6a7eafcbee764e9ee59a0)), closes [#998](https://github.com/vuejs/vue-next/issues/998)
* **types:** update to Typescript 3.9 ([#1106](https://github.com/vuejs/vue-next/issues/1106)) ([97dedeb](https://github.com/vuejs/vue-next/commit/97dedebd8097116a16209664a1ca38392b964da3))


### Performance Improvements

* only patch string style when value has changed ([#1310](https://github.com/vuejs/vue-next/issues/1310)) ([d4e9b19](https://github.com/vuejs/vue-next/commit/d4e9b19932dac686f57091e66f21a80d4c5db881)), closes [#1309](https://github.com/vuejs/vue-next/issues/1309)
* optimize LRU access in keep-alive ([#1316](https://github.com/vuejs/vue-next/issues/1316)) ([1f2926a](https://github.com/vuejs/vue-next/commit/1f2926a33c78b6a6f4752a01b88f7cad809ed302))



# [3.0.0-beta.14](https://github.com/vuejs/vue-next/compare/v3.0.0-beta.13...v3.0.0-beta.14) (2020-05-18)


### Bug Fixes

* **compiler-dom:** should bail stringification on runtime constant regardless of position ([dd2bfb5](https://github.com/vuejs/vue-next/commit/dd2bfb5a8f5b897a621b3ebb89a9fb1b8e4c63cd)), closes [vuejs/vite#157](https://github.com/vuejs/vite/issues/157)
* **reactivity:** shallowReactive for collections ([#1204](https://github.com/vuejs/vue-next/issues/1204)) ([488e2bc](https://github.com/vuejs/vue-next/commit/488e2bcfef8dd69d15c224d94a433680db140ef9)), closes [#1202](https://github.com/vuejs/vue-next/issues/1202)
* **runtime-dom:** event handlers with modifiers should get all event arguments ([#1193](https://github.com/vuejs/vue-next/issues/1193)) ([ab86b19](https://github.com/vuejs/vue-next/commit/ab86b190ce540336a01f936baa836f1aefd90e85))
* **Transition:** fix validate duration ([#1188](https://github.com/vuejs/vue-next/issues/1188)) ([d73a508](https://github.com/vuejs/vue-next/commit/d73a508a73c03d64cea0c376e25f4f0272728a18))
* **v-model:** should not trigger updates during input composition ([#1183](https://github.com/vuejs/vue-next/issues/1183)) ([83b7158](https://github.com/vuejs/vue-next/commit/83b7158017325db03e5c677b5f1c6adfe41d1ca4))


### Features

* **watch:** support directly watching reactive object in multiple sources with deep default ([#1201](https://github.com/vuejs/vue-next/issues/1201)) ([ba62ccd](https://github.com/vuejs/vue-next/commit/ba62ccd55d659a874ece4b26454ae31c6de72f59))



# [3.0.0-beta.13](https://github.com/vuejs/vue-next/compare/v3.0.0-beta.12...v3.0.0-beta.13) (2020-05-17)


### Features

* improve static content stringification ([d965bb6](https://github.com/vuejs/vue-next/commit/d965bb6227d53b715cfb797114b9452a6db841ec))



# [3.0.0-beta.12](https://github.com/vuejs/vue-next/compare/v3.0.0-beta.11...v3.0.0-beta.12) (2020-05-11)


### Bug Fixes

* **hmr:** static child traversal should only affect elements ([2bc6a8c](https://github.com/vuejs/vue-next/commit/2bc6a8c1cf4f409eea0cefa8b8a7619aae1f3569))



# [3.0.0-beta.11](https://github.com/vuejs/vue-next/compare/v3.0.0-beta.10...v3.0.0-beta.11) (2020-05-11)


### Bug Fixes

* **hmr:** always force full child component props update in HMR mode ([1b946c8](https://github.com/vuejs/vue-next/commit/1b946c85df3d213900faccfa0723d736fa0927a3))
* **hmr:** ensure static nodes inherit DOM element in hmr mode ([66c5a55](https://github.com/vuejs/vue-next/commit/66c5a556dc5b27e9a72fa7176fbb45d8c4c515b7)), closes [#1156](https://github.com/vuejs/vue-next/issues/1156)
* **runtime-core:** should not take unmount children fast path for v-for fragments ([5b8883a](https://github.com/vuejs/vue-next/commit/5b8883a84689dd04dbbcd677bf177ffeda43489d)), closes [#1153](https://github.com/vuejs/vue-next/issues/1153)
* **transition:** should reset enter class after appear ([#1152](https://github.com/vuejs/vue-next/issues/1152)) ([697de07](https://github.com/vuejs/vue-next/commit/697de07e630c502db42e93e64ba556cc4599cbe4))


### Features

* **runtime-core:** expose isVNode ([a165d82](https://github.com/vuejs/vue-next/commit/a165d8293dbd092828b14530577d45e2af40deda))



# [3.0.0-beta.10](https://github.com/vuejs/vue-next/compare/v3.0.0-beta.9...v3.0.0-beta.10) (2020-05-07)


### Bug Fixes

* **compiler:** warn against v-bind with empty attribute value ([675330b](https://github.com/vuejs/vue-next/commit/675330ba542022935ebbb2d31af3ba643c37a5eb)), closes [github.com/vuejs/vue-next/issues/1128#issuecomment-624647434](https://github.com/vuejs/vue-next/issues/1128#issuecomment-624647434)
* **compiler-dom:** bail static stringfication on non-attr bindings ([304ab8c](https://github.com/vuejs/vue-next/commit/304ab8c99b954de4aa9ab6a5387116228345f544)), closes [#1128](https://github.com/vuejs/vue-next/issues/1128)
* **compiler-sfc:** should not transform external asset url with ([d662118](https://github.com/vuejs/vue-next/commit/d66211849ca174c4458b59d3df5569730ee224f6))
* **compiler-sfc:** template with alt lang should be parsed as raw text ([d10835a](https://github.com/vuejs/vue-next/commit/d10835aee73e3be579c728df634fbaa8fe3a0e0f)), closes [#1120](https://github.com/vuejs/vue-next/issues/1120)
* **reactivity:** fix `__proto__` access on proxy objects ([#1133](https://github.com/vuejs/vue-next/issues/1133)) ([037fa07](https://github.com/vuejs/vue-next/commit/037fa07113eff6792cda58f91169d26cf6033aea))
* **reactivity:** use correct thisArg for collection method callbacks ([#1132](https://github.com/vuejs/vue-next/issues/1132)) ([e08f6f0](https://github.com/vuejs/vue-next/commit/e08f6f0ede03d09e71e44de5e524abd9789971d8))
* **runtime-dom/style:** normalize string when merging styles ([#1127](https://github.com/vuejs/vue-next/issues/1127)) ([2d9f136](https://github.com/vuejs/vue-next/commit/2d9f1360778154a232473fcf93f6164a6bd80ca5))


### Code Refactoring

* **compiler/types:** convert compiler options documentation to jsdoc ([e58beec](https://github.com/vuejs/vue-next/commit/e58beecc97635ea61e39b84ea406fcc42166095b))


### Features

* **compiler-sfc:** improve sfc source map generation ([698c8d3](https://github.com/vuejs/vue-next/commit/698c8d35d55ae6a157d7aad5ffb1f3a27e0b3970))
* **types:** re-expose trasnformVNodeArgs ([40166a8](https://github.com/vuejs/vue-next/commit/40166a8637a0f0272eb80777650398ccc067af88))


### Performance Improvements

* **compiler-sfc:** improve asset url transform efficiency ([c5dcfe1](https://github.com/vuejs/vue-next/commit/c5dcfe16f6cd3503ce1d5349cfacbe099a7e19be))
* **compiler-sfc:** only add character mapping if not whitespace ([2f69167](https://github.com/vuejs/vue-next/commit/2f69167e889f2817138629a04c01c6baf565d485))


### BREAKING CHANGES

* **compiler/types:** `getTextMode` compiler option signature has changed from

  ```ts
  (tag: string, ns: string, parent: ElementNode | undefined) => TextModes
  ```

  to

  ```ts
  (node: ElementNode, parent: ElementNode | undefined) => TextModes
  ```



# [3.0.0-beta.9](https://github.com/vuejs/vue-next/compare/v3.0.0-beta.8...v3.0.0-beta.9) (2020-05-04)


### Bug Fixes

* **compiler:** bail strigification on runtime constant expressions ([f9a3766](https://github.com/vuejs/vue-next/commit/f9a3766fd68dc6996cdbda6475287c4005f55243))
* **transitionGroup:** fix transition children resolving condition ([f05aeea](https://github.com/vuejs/vue-next/commit/f05aeea7aec2e6cd859f40edc6236afd0ce2ea7d))


### Features

* **compiler-sfc:** support transforming absolute asset urls ([6a0be88](https://github.com/vuejs/vue-next/commit/6a0be882d4ce95eb8d8093f273ea0e868acfcd24))


### BREAKING CHANGES

* **compiler-sfc:** `@vue/compiler-sfc`'s `transformAssetUrlsBase` option
has been removed. It is merged into `trasnformAssetUrls` which now also
accepts the format of

  ```ts
  {
    base?: string
    includeAbsolute?: string
    tags?: { [name: string]: string[] }
  }
  ```



# [3.0.0-beta.8](https://github.com/vuejs/vue-next/compare/v3.0.0-beta.7...v3.0.0-beta.8) (2020-05-04)


### Bug Fixes

* **hmr:** handle cases where instances with same id having different definitions ([01b7e90](https://github.com/vuejs/vue-next/commit/01b7e90eac88c79ed38a396f824f71c6653736c8))
* **reactivity:** avoid polluting Object prototype ([f40f3a0](https://github.com/vuejs/vue-next/commit/f40f3a0e9589bfa096d365f735c9bb54b9853fd3))
* **reactivity:** check own property for existing proxy of target ([6be2b73](https://github.com/vuejs/vue-next/commit/6be2b73f8aeb26be72eab22259c8a513b59b910f)), closes [#1107](https://github.com/vuejs/vue-next/issues/1107)
* **transitionGroup:** inner children should skip comment node ([#1105](https://github.com/vuejs/vue-next/issues/1105)) ([26a50ce](https://github.com/vuejs/vue-next/commit/26a50ce67f64439cfc242fba59b1e7129e59ba40))
* **types/reactivity:** fix ref type inference on nested reactive properties with .value ([bc1f097](https://github.com/vuejs/vue-next/commit/bc1f097e29c5c823737503532baa23c11d4824f8)), closes [#1111](https://github.com/vuejs/vue-next/issues/1111)


### Features

* **shared:** support Map and Set in toDisplayString ([3c60d40](https://github.com/vuejs/vue-next/commit/3c60d40827f65cbff024cfda4bb981a742bb83a7)), closes [#1067](https://github.com/vuejs/vue-next/issues/1067) [#1100](https://github.com/vuejs/vue-next/issues/1100)
* **types:** re-expose resolve asset utitlies and registerRuntimeCompiler in type definitions ([64ef7c7](https://github.com/vuejs/vue-next/commit/64ef7c76bf0dfa4897d930e9d369a026d1ecbaf6)), closes [#1109](https://github.com/vuejs/vue-next/issues/1109)
* **watch:** support directly watching reactive object with deep default ([6b33cc4](https://github.com/vuejs/vue-next/commit/6b33cc422933a004fb116fc5182b3fa3a32567ff)), closes [#1110](https://github.com/vuejs/vue-next/issues/1110)



# [3.0.0-beta.7](https://github.com/vuejs/vue-next/compare/v3.0.0-beta.6...v3.0.0-beta.7) (2020-05-02)


### Bug Fixes

* **warn:** cast symbols to strings ([#1103](https://github.com/vuejs/vue-next/issues/1103)) ([71a942b](https://github.com/vuejs/vue-next/commit/71a942b25a2cad61c3d670075523c31d296c7089))


### Features

* **compiler-sfc:** add transformAssetUrlsBase option ([36972c2](https://github.com/vuejs/vue-next/commit/36972c20b5c2451c8345361f9c015655afbfdd87))
* **types:** re-expose `withDirectives` as public type ([583ba0c](https://github.com/vuejs/vue-next/commit/583ba0c172de7a2fd0d2dc93ad7e4f40c53ba7ac))



# [3.0.0-beta.6](https://github.com/vuejs/vue-next/compare/v3.0.0-beta.5...v3.0.0-beta.6) (2020-05-01)


### Bug Fixes

* **compiler-core:** hoist pure annotations should apply to all nested calls ([c5e7d8b](https://github.com/vuejs/vue-next/commit/c5e7d8b532685e1e33e1cfb316f75c1b61109ee7))
* **compiler-core:** hoisted vnode calls and scoped id calls should be marked pure ([cad25d9](https://github.com/vuejs/vue-next/commit/cad25d95a3171628b0c95e89fb8e52eb5f41bbc5))
* **compiler-ssr:** handle comments codegen + refactor ssr codegen transform ([6c60ce1](https://github.com/vuejs/vue-next/commit/6c60ce13e061b43d314dde022d3f43ece7f03c30))
* **runtime-core:** avoid infinite warning loop for isRef check on component public proxy ([6233608](https://github.com/vuejs/vue-next/commit/62336085f497d42f0007bf9ad33f078d273605a6)), closes [#1091](https://github.com/vuejs/vue-next/issues/1091)
* **runtime-core:** cloned vnodes with extra props should de-opt ([08bf7e3](https://github.com/vuejs/vue-next/commit/08bf7e360783d520bae3fbe37143c52d360bd52d))
* **runtime-core:** fix slot fragment bail check ([ac6a6f1](https://github.com/vuejs/vue-next/commit/ac6a6f11ac3931c723c9aca8a351768ea2cacf38))
* **runtime-core:** should call Suspense fallback unmount hook ([#1061](https://github.com/vuejs/vue-next/issues/1061)) ([8b85aae](https://github.com/vuejs/vue-next/commit/8b85aaeea9b2ed343e2ae19958abbd9e5d223a77)), closes [#1059](https://github.com/vuejs/vue-next/issues/1059)
* **runtime-core:** should catch dom prop set TypeErrors ([98bee59](https://github.com/vuejs/vue-next/commit/98bee596bddc8131cccfde4a11fa2e5cd9bf39e4)), closes [#1051](https://github.com/vuejs/vue-next/issues/1051)
* **runtime-dom:** should not coerce nullish values to empty strings for non-string dom props ([20bc7ba](https://github.com/vuejs/vue-next/commit/20bc7ba1c55b43143a4cef98cadaad8d693f9275)), closes [#1049](https://github.com/vuejs/vue-next/issues/1049) [#1092](https://github.com/vuejs/vue-next/issues/1092) [#1093](https://github.com/vuejs/vue-next/issues/1093) [#1094](https://github.com/vuejs/vue-next/issues/1094)
* **ssr:** fix escape and handling for raw Text, Comment and Static vnodes ([5b09e74](https://github.com/vuejs/vue-next/commit/5b09e743a01a4dbc73b98ecf130a3a5f95ce41fe))
* **teleport:** teleport should always be tracked as dynamic child for unmount ([7f23555](https://github.com/vuejs/vue-next/commit/7f2355535613f1f5f5902cc7ca235fca8ee5493c)), closes [#1088](https://github.com/vuejs/vue-next/issues/1088)
* **types:** augment ref unwrap bail types in appropriate packages ([b40fcbc](https://github.com/vuejs/vue-next/commit/b40fcbc4c66125bf6b390e208b61635a9e2c003f))


### Code Refactoring

* **types:** mark internal API exports and exclude from d.ts ([c9bf7de](https://github.com/vuejs/vue-next/commit/c9bf7ded2e74790c902384e13c1d444c7136c1f9))


### Features

* **runtime-core:** warn against user properties with reserved prefixes ([1bddeea](https://github.com/vuejs/vue-next/commit/1bddeea24797fe5c66e469bb6bc526c17bfb7fde))


### Performance Improvements

* instance public proxy should never be observed ([11f38d8](https://github.com/vuejs/vue-next/commit/11f38d8a853b2d8043212c17612b63df92322de4))


### BREAKING CHANGES

* **types:** Internal APIs are now excluded from type declarations.



# [3.0.0-beta.5](https://github.com/vuejs/vue-next/compare/v3.0.0-beta.4...v3.0.0-beta.5) (2020-04-30)


### Bug Fixes

* **compiler-ssr:** avoid unnecessary withCtx import ([08b4e88](https://github.com/vuejs/vue-next/commit/08b4e8815da4e8911058ccbab986bea6365c3352))
* **hmr:** support hmr for static nodes ([386b093](https://github.com/vuejs/vue-next/commit/386b093554c8665fa6a9313b61c0a9359c4ec819))
* **hydration:** fix text mismatch warning ([e087b4e](https://github.com/vuejs/vue-next/commit/e087b4e02467db18766b7acc2218b3d38d60ce8b))
* **keep-alive:** do not invoke onVnodeBeforeUnmount if is KeepAlive component ([#1079](https://github.com/vuejs/vue-next/issues/1079)) ([239270c](https://github.com/vuejs/vue-next/commit/239270c38a56782bd7f29802cb583b0a8a5a4df4))
* **transition-group:** should collect raw children with Fragment ([#1046](https://github.com/vuejs/vue-next/issues/1046)) ([8ed3455](https://github.com/vuejs/vue-next/commit/8ed3455251d721e62fd7f6f75a7ef04bc411c152)), closes [#1045](https://github.com/vuejs/vue-next/issues/1045)
* **warning:** always check for component instance presence when formatting traces ([a0e2c12](https://github.com/vuejs/vue-next/commit/a0e2c1287466567d945e87496ce2f922f3dc6d8c))


### Features

* **runtime-core:** export queuePostFlushCb ([#1078](https://github.com/vuejs/vue-next/issues/1078)) ([ba240eb](https://github.com/vuejs/vue-next/commit/ba240eb497de75acd5f31ff6b3803da0560027d8))


### types

* use more consistent naming for apiWatch type exports ([892fb6d](https://github.com/vuejs/vue-next/commit/892fb6d2290516df44241992b62d65f1376f611a))


### BREAKING CHANGES

* Some watch API types are renamed.

    - `BaseWatchOptions` -> `WatchOptionsBase`
    - `StopHandle` -> `WatchStopHandle`



# [3.0.0-beta.4](https://github.com/vuejs/vue-next/compare/v3.0.0-beta.3...v3.0.0-beta.4) (2020-04-24)


### Bug Fixes

* **compiler-core:** dynamic component should always be made blocks ([7d0ab33](https://github.com/vuejs/vue-next/commit/7d0ab3392af5285147db111759fe380688ca17ea)), closes [#1018](https://github.com/vuejs/vue-next/issues/1018)
* **runtime-core:** dynamic component should support falsy values without warning ([ded92f9](https://github.com/vuejs/vue-next/commit/ded92f93b423cda28a40746c1f5fa9bcba56e80d))
* **runtime-core:** fix dynamic node tracking in dynamic component that resolves to plain elements ([dcf2458](https://github.com/vuejs/vue-next/commit/dcf2458fa84d7573273b0306aaabcf28ee859622)), closes [#1039](https://github.com/vuejs/vue-next/issues/1039)
* **runtime-core:** fix key/ref resolution for cloneVNode ([d7379c7](https://github.com/vuejs/vue-next/commit/d7379c7647e3222eddd18d7dad8d2520f59deb8a)), closes [#1041](https://github.com/vuejs/vue-next/issues/1041)
* **runtime-core:** mixin options that rely on this context should be deferred ([ff4d1fc](https://github.com/vuejs/vue-next/commit/ff4d1fcd81d96f3ddb0e34f04e70e3539dc7a96f)), closes [#1016](https://github.com/vuejs/vue-next/issues/1016) [#1029](https://github.com/vuejs/vue-next/issues/1029)
* **runtime-core:** only infer component name for object components ([e422b8b](https://github.com/vuejs/vue-next/commit/e422b8b082f1765f596c3ae0ff5b2e65d756405a)), closes [#1023](https://github.com/vuejs/vue-next/issues/1023)
* **slots:** compiled slot fallback should be functions ([#1030](https://github.com/vuejs/vue-next/issues/1030)) ([2b19965](https://github.com/vuejs/vue-next/commit/2b19965bcf75d981400ed58a0348bcfc13f17e33)), closes [#1021](https://github.com/vuejs/vue-next/issues/1021)
* **types:** fix ref(false) type to Ref<boolean> ([#1028](https://github.com/vuejs/vue-next/issues/1028)) ([0bdd889](https://github.com/vuejs/vue-next/commit/0bdd8891569eb15e492007b3eb0f45d598e85b3f))
* **types:** make return type of `defineComponent` assignable to `Component` type ([#1032](https://github.com/vuejs/vue-next/issues/1032)) ([f3a9b51](https://github.com/vuejs/vue-next/commit/f3a9b516bd6feb42d1ea611faf6550f709fd3173)), closes [#993](https://github.com/vuejs/vue-next/issues/993)


### Features

* **compiler-sfc:** add preprocessCustomRequire option ([20d425f](https://github.com/vuejs/vue-next/commit/20d425fb19e04cd5b66f76b0f52ca221c92eb74c))
* **compiler-sfc:** built-in support for css modules ([fa216a0](https://github.com/vuejs/vue-next/commit/fa216a0c3adc70ff74deca872e295a154fa147c8))
* **reactivity:** add triggerRef API ([2acf3e8](https://github.com/vuejs/vue-next/commit/2acf3e84b95d7f18925b4d7ada92f1992f5b7ee3))
* **types:** expose `ToRefs` type ([#1037](https://github.com/vuejs/vue-next/issues/1037)) ([28b4c31](https://github.com/vuejs/vue-next/commit/28b4c317b412e0c08bb791d647d4234078c41542))


### Performance Improvements

* **reactivity:** ref should not trigger if value did not change ([b0d4df9](https://github.com/vuejs/vue-next/commit/b0d4df974339a570fd30263797cf948619e1f57b)), closes [#1012](https://github.com/vuejs/vue-next/issues/1012)



# [3.0.0-beta.3](https://github.com/vuejs/vue-next/compare/v3.0.0-beta.2...v3.0.0-beta.3) (2020-04-20)


### Bug Fixes

* **runtime-core:** should not cast prop value if prop did not change ([171cfa4](https://github.com/vuejs/vue-next/commit/171cfa404f33a451376dcb84d66ddae012c343ec)), closes [#999](https://github.com/vuejs/vue-next/issues/999)
* **warn:** fix component name inference in warning trace ([0278992](https://github.com/vuejs/vue-next/commit/0278992f78834bc8df677c4e8ec891bb79510edb))


### Features

* **build:** provide more specific warnings for runtime compilation ([e954ba2](https://github.com/vuejs/vue-next/commit/e954ba21f04f0ef848c687233fcb849d75e4153f)), closes [#1004](https://github.com/vuejs/vue-next/issues/1004)
* **runtime-core:** improve warning for extraneous event listeners ([#1005](https://github.com/vuejs/vue-next/issues/1005)) ([cebad64](https://github.com/vuejs/vue-next/commit/cebad64d224ff9a2b7976643c85d55d8ec53ee54)), closes [#1001](https://github.com/vuejs/vue-next/issues/1001)
* **runtime-core:** more specific warning for failed v-on fallthrough ([ab844fd](https://github.com/vuejs/vue-next/commit/ab844fd1692007cf2be4d01a9062caa36fa1d280)), closes [#1001](https://github.com/vuejs/vue-next/issues/1001)
* **warn:** infer anonymous component named based on resolve name ([dece610](https://github.com/vuejs/vue-next/commit/dece6102aa84c115a3d6481c6e0f27e5b4be3ef1))


### Performance Improvements

* **core:** use `startsWith` instead of `indexOf` ([#989](https://github.com/vuejs/vue-next/issues/989)) ([054ccec](https://github.com/vuejs/vue-next/commit/054ccecd58c36b909661598f43a4056ed07e59c2))



# [3.0.0-beta.2](https://github.com/vuejs/vue-next/compare/v3.0.0-beta.1...v3.0.0-beta.2) (2020-04-17)


### Bug Fixes

* **runtime-core:** fix user attached public instance properties that start with "$" ([d7ca1c5](https://github.com/vuejs/vue-next/commit/d7ca1c5c6e75648793d670299c9059b6db9b1715))
* **watch:** fix deep watchers on refs containing primitives ([#984](https://github.com/vuejs/vue-next/issues/984)) ([99fd158](https://github.com/vuejs/vue-next/commit/99fd158d090594a433b57d9ff9420f3aed48ad2d))


### Features

* **types:** expose `ComponentCustomOptions` for declaring custom options ([c0adb67](https://github.com/vuejs/vue-next/commit/c0adb67c2e10d07af74304accbc1c79d19f6c196))
* **types:** expose `ExtractPropTypes` ([#983](https://github.com/vuejs/vue-next/issues/983)) ([4cf5e07](https://github.com/vuejs/vue-next/commit/4cf5e07608a85f1526b89e90ee3710d40cb5a964))
* **types** add `ComponentCustomProperties` interface ([#982](https://github.com/vuejs/vue-next/issues/982)) ([be21cfb](https://github.com/vuejs/vue-next/commit/be21cfb1db1a60fb0f2dda57d7f62d1c126a064b))



# [3.0.0-beta.1](https://github.com/vuejs/vue-next/compare/v3.0.0-alpha.13...v3.0.0-beta.1) (2020-04-16)


### Bug Fixes

* **reactivity:** remove Symbol.observable ([#968](https://github.com/vuejs/vue-next/issues/968)) ([4d014dc](https://github.com/vuejs/vue-next/commit/4d014dc3d361c52ac6192c063100ad8655a6e397))


### Code Refactoring

* **reactivity:** adjust APIs ([09b4202](https://github.com/vuejs/vue-next/commit/09b4202a22ae03072a8a8405511e37f65b626568))


### Features

* **runtime-core:** skip emit warn if has equivalent onXXX prop ([0709380](https://github.com/vuejs/vue-next/commit/0709380c5faf0a86c25a0564781fdb2650c9c353))


### Performance Improvements

* **runtime-core:** use raw context on component options init ([bfd6744](https://github.com/vuejs/vue-next/commit/bfd6744fb1db36a02914ef48da7116636343f313))


### BREAKING CHANGES

* **reactivity:** Reactivity APIs adjustments:

- `readonly` is now non-tracking if called on plain objects.
  `lock` and `unlock` have been removed. A `readonly` proxy can no
  longer be directly mutated. However, it can still wrap an already
  reactive object and track changes to the source reactive object.

- `isReactive` now only returns true for proxies created by `reactive`,
   or a `readonly` proxy that wraps a `reactive` proxy.

- A new utility `isProxy` is introduced, which returns true for both
  reactive or readonly proxies.

- `markNonReactive` has been renamed to `markRaw`.



# [3.0.0-alpha.13](https://github.com/vuejs/vue-next/compare/v3.0.0-alpha.12...v3.0.0-alpha.13) (2020-04-15)


### Bug Fixes

* **compiler-core:** should not generate CLASS/STYLE patch flags on components ([a6e2b10](https://github.com/vuejs/vue-next/commit/a6e2b1052a4d461767147a6c13854fcb4f9509d2)), closes [#677](https://github.com/vuejs/vue-next/issues/677)
* **runtime-core:** fix kebab-case props update ([7cbf684](https://github.com/vuejs/vue-next/commit/7cbf68461118ced0c7c6eb79a395ae2b148e3737)), closes [#955](https://github.com/vuejs/vue-next/issues/955)
* **runtime-core:** should resolve value instead of delete for dynamic props with options ([c80b857](https://github.com/vuejs/vue-next/commit/c80b857eb5b19f48f498147479a779af9953be32))
* **runtime-dom:** fix patching for attributes starting with `on` ([6eb3399](https://github.com/vuejs/vue-next/commit/6eb339931185a57cc36ddb6e12314a5283948169)), closes [#949](https://github.com/vuejs/vue-next/issues/949)
* **runtime-dom:** should patch svg innerHtml ([#956](https://github.com/vuejs/vue-next/issues/956)) ([27b5c71](https://github.com/vuejs/vue-next/commit/27b5c71944637bc04d715382851cc63ca7efc47a))
* **runtime-dom/v-on:** support event.stopImmediatePropagation on multiple listeners ([d45e475](https://github.com/vuejs/vue-next/commit/d45e47569d366b932c0e3461afc6478b45a4602d)), closes [#916](https://github.com/vuejs/vue-next/issues/916)
* **scheduler:** sort jobs before flushing ([78977c3](https://github.com/vuejs/vue-next/commit/78977c399734da7c4f8d58f2ccd650533e89249f)), closes [#910](https://github.com/vuejs/vue-next/issues/910) [/github.com/vuejs/vue-next/issues/910#issuecomment-613097539](https://github.com//github.com/vuejs/vue-next/issues/910/issues/issuecomment-613097539)
* **types:** UnwrapRef should bail on DOM element types ([#952](https://github.com/vuejs/vue-next/issues/952)) ([33ccfc0](https://github.com/vuejs/vue-next/commit/33ccfc0a8b69de13065c4b995f88722dd72a1ae9)), closes [#951](https://github.com/vuejs/vue-next/issues/951)


### Code Refactoring

* **reactivity:** remove stale API `markReadonly` ([e8a866e](https://github.com/vuejs/vue-next/commit/e8a866ec9945ec0464035be4c4c58d6212080a50))
* **runtime-core:** remove emit return value ([55566e8](https://github.com/vuejs/vue-next/commit/55566e8f520eee8a07b85221174989c47c443c35))


### Features

* **reactivity:** add support for `customRef` API ([b83c580](https://github.com/vuejs/vue-next/commit/b83c5801315e5e28ac51ecff743206e665f4d868))
* **reactivity:** add support for `toRef` API ([486dc18](https://github.com/vuejs/vue-next/commit/486dc188fe1593448d2bfb0c3c4c3c02b2d78ea4))
* **runtime-core:** detect and warn against components made reactive ([2e06f5b](https://github.com/vuejs/vue-next/commit/2e06f5bbe84155588dea82d90822a41dc93d0688)), closes [#962](https://github.com/vuejs/vue-next/issues/962)
* **runtime-core:** warn async data() ([3e7bb7d](https://github.com/vuejs/vue-next/commit/3e7bb7d110818d7b90ca4acc47afc30508f465b7))


### Reverts

* Revert "feat(reactivity): add effect to public api (#909)" (#961) ([9e9d264](https://github.com/vuejs/vue-next/commit/9e9d2644127a17f770f325d1f1c88b12a34c8789)), closes [#909](https://github.com/vuejs/vue-next/issues/909) [#961](https://github.com/vuejs/vue-next/issues/961)


### BREAKING CHANGES

* **reactivity:** `markReadonly` has been removed.
* **runtime-dom:** Only props starting with `on` followed by an uppercase
letter or a non-letter character are considered event listeners.
* **runtime-core:** this.$emit() and setupContext.emit() no longer
return values. For logic that relies on return value of listeners,
the listener should be declared as an `onXXX` prop and be called
directly. This still allows the parent component to pass in
a handler using `v-on`, since `v-on:foo` internally compiles
to `onFoo`.

    ref: https://github.com/vuejs/rfcs/pull/16



# [3.0.0-alpha.12](https://github.com/vuejs/vue-next/compare/v3.0.0-alpha.11...v3.0.0-alpha.12) (2020-04-08)


### Bug Fixes

* **compiler:** should not condense `&nbsp;` ([8c17535](https://github.com/vuejs/vue-next/commit/8c17535a470501f7f4ec3747cd3de25d9169c505)), closes [#945](https://github.com/vuejs/vue-next/issues/945)
* **compiler:** should only strip leading newline directly in pre tag ([be666eb](https://github.com/vuejs/vue-next/commit/be666ebd59027eb2fc96595c1a6054ecf62832e8))
* **compiler:** support full range of entity decoding in browser builds ([1f6e72b](https://github.com/vuejs/vue-next/commit/1f6e72b11051561abe270fa233cf52d5aba01d6b))
* **compiler-core:** elements with dynamic keys should be forced into blocks ([d531686](https://github.com/vuejs/vue-next/commit/d531686f9154c2ef7f1d877c275df62a8d8da2a5)), closes [#916](https://github.com/vuejs/vue-next/issues/916)
* **reactivity:** track reactive keys in raw collection types ([5dcc645](https://github.com/vuejs/vue-next/commit/5dcc645fc068f9a467fa31ba2d3c2a59e68a9fd7)), closes [#919](https://github.com/vuejs/vue-next/issues/919)
* **runtime-core:** fix globalProperties in check on instance render proxy ([c28a919](https://github.com/vuejs/vue-next/commit/c28a9196b2165e8ce274b2708d6d772024c2933a))
* **runtime-core:** set fragment root children should also update dynamicChildren ([#944](https://github.com/vuejs/vue-next/issues/944)) ([a27e9ee](https://github.com/vuejs/vue-next/commit/a27e9ee9aea3487ef3ef0c8a5df53227fc172886)), closes [#943](https://github.com/vuejs/vue-next/issues/943)
* **runtime-dom:** fix getModelAssigner order in vModelCheckbox ([#926](https://github.com/vuejs/vue-next/issues/926)) ([da1fb7a](https://github.com/vuejs/vue-next/commit/da1fb7afef75470826501fe6e9d81e5af296fea7))
* **runtime-dom:** support native onxxx handlers ([2302dea](https://github.com/vuejs/vue-next/commit/2302dea1624d4b964fed71e30089426212091c11)), closes [#927](https://github.com/vuejs/vue-next/issues/927)
* **slots:** should update compiled dynamic slots ([8444078](https://github.com/vuejs/vue-next/commit/84440780f9e45aa5b060180078b769f27757c7bd))
* **transition:** fix dynamic transition update on nested HOCs ([b8da8b2](https://github.com/vuejs/vue-next/commit/b8da8b2dfac96558df1d038aac3bbe63bd42a8ce))
* **transition:** should ship props declarations in production ([4227831](https://github.com/vuejs/vue-next/commit/42278317e15a202e4e1c8f7084eafa7bb13f1ade))
* **types:** accept generic Component type in h() ([c1d5928](https://github.com/vuejs/vue-next/commit/c1d5928f3b240a4a69bcd8d88494e4fe8d2e625b)), closes [#922](https://github.com/vuejs/vue-next/issues/922)
* **v-model:** handle dynamic assigners and array assigners ([f42d11e](https://github.com/vuejs/vue-next/commit/f42d11e8e19f7356f4e1629cd07c774c9af39288)), closes [#923](https://github.com/vuejs/vue-next/issues/923)


### Features

* **asyncComponent:** add `onError` option for defineAsyncComponent ([e804463](https://github.com/vuejs/vue-next/commit/e80446349215159c002223a41baeb5a8bc0f444c))
* **runtime-core:** improve component public instance proxy inspection ([899287a](https://github.com/vuejs/vue-next/commit/899287ad35d8b74e76a71f39772a92f261dfa4f8))


### BREAKING CHANGES

* **compiler:** compiler options have been adjusted.
    - new option `decodeEntities` is added.
    - `namedCharacterReferences` option has been removed.
    - `maxCRNameLength` option has been removed.
* **asyncComponent:** `retryWhen` and `maxRetries` options for
`defineAsyncComponent` has been replaced by the more flexible `onError`
option, per https://github.com/vuejs/rfcs/pull/148



# [3.0.0-alpha.11](https://github.com/vuejs/vue-next/compare/v3.0.0-alpha.10...v3.0.0-alpha.11) (2020-04-04)


### Bug Fixes

* **compiler:** fix pre tag whitespace handling ([7f30cb5](https://github.com/vuejs/vue-next/commit/7f30cb577257ad5765261bbffa3cae862259fcab)), closes [#908](https://github.com/vuejs/vue-next/issues/908)
* **compiler-core/slots:** should support on-component named slots ([a022b63](https://github.com/vuejs/vue-next/commit/a022b63605820c97923413ee457ba1fb69a5221e))
* **compiler-sfc:** always use offset for template block sourcemaps ([#911](https://github.com/vuejs/vue-next/issues/911)) ([db50009](https://github.com/vuejs/vue-next/commit/db5000935306214b31e33865cd57935e80e27d41))
* **inject:** allow default value to be `undefined` ([#894](https://github.com/vuejs/vue-next/issues/894)) ([94562da](https://github.com/vuejs/vue-next/commit/94562daea70fde33a340bb7b57746523c3660a8e)), closes [#892](https://github.com/vuejs/vue-next/issues/892)
* **portal:** portal should always remove its children when unmounted ([16cd8ee](https://github.com/vuejs/vue-next/commit/16cd8eee7839cc4613f17642bf37b39f7bdf1fce))
* **reactivity:** scheduled effect should not execute if stopped ([0764c33](https://github.com/vuejs/vue-next/commit/0764c33d3da8c06d472893a4e451e33394726a42)), closes [#910](https://github.com/vuejs/vue-next/issues/910)
* **runtime-core:** support attr merging on child with root level comments ([e42cb54](https://github.com/vuejs/vue-next/commit/e42cb543947d4286115b6adae6e8a5741d909f14)), closes [#904](https://github.com/vuejs/vue-next/issues/904)
* **runtime-dom:** v-cloak should be removed after compile on the root element ([#893](https://github.com/vuejs/vue-next/issues/893)) ([0ed147d](https://github.com/vuejs/vue-next/commit/0ed147d33610b86af72cbadcc4b32e6069bcaf08)), closes [#890](https://github.com/vuejs/vue-next/issues/890)
* **runtime-dom:** properly support creating customized built-in element ([b1d0b04](https://github.com/vuejs/vue-next/commit/b1d0b046afb1e8f4640d8d80b6eeaf9f89e892f7))
* **transition:** warn only when there is more than one rendered child ([#903](https://github.com/vuejs/vue-next/issues/903)) ([37b1dc8](https://github.com/vuejs/vue-next/commit/37b1dc8242608b072d14fd2a5e52f5d40829ea52))
* **types:** allow use PropType with Function ([#915](https://github.com/vuejs/vue-next/issues/915)) ([026eb72](https://github.com/vuejs/vue-next/commit/026eb729f3d1566e95f2f4253d76c20e86d1ec9b)), closes [#748](https://github.com/vuejs/vue-next/issues/748)
* **types:** export missing types from runtime-core ([#889](https://github.com/vuejs/vue-next/issues/889)) ([412ec86](https://github.com/vuejs/vue-next/commit/412ec86128fa33fa41ce435c493fd8275a785fea))
* **types/reactivity:** add generics constraint for markNonReactive ([f3b6559](https://github.com/vuejs/vue-next/commit/f3b6559408fb42ff6dc0c67001c9c67093f2b059)), closes [#917](https://github.com/vuejs/vue-next/issues/917)


### Code Refactoring

* **runtime-core:** adjust attr fallthrough behavior ([21bcdec](https://github.com/vuejs/vue-next/commit/21bcdec9435700cac98868a36716b49a7766c48d))
* rename `<portal>` to `<teleport>` ([eee5095](https://github.com/vuejs/vue-next/commit/eee50956924d7d2c916cdb8b99043da616e53af5))
* **runtime-core:** rename `createAsyncComponent` to `defineAsyncComponent` ([#888](https://github.com/vuejs/vue-next/issues/888)) ([ebc5873](https://github.com/vuejs/vue-next/commit/ebc587376ca1fb4bb8a20d4137332740605753c8))


### Features

* **asyncComponent:** retry support ([c01930e](https://github.com/vuejs/vue-next/commit/c01930e60b4abf481900cdfcc2ba422890c41656))
* **compiler-core:** export `transformElement` from compiler-core ([#907](https://github.com/vuejs/vue-next/issues/907)) ([20f4965](https://github.com/vuejs/vue-next/commit/20f4965b45d410a2fe95310ecf7293b2b7f46f36))
* **compiler-core:** support v-is ([b8ffbff](https://github.com/vuejs/vue-next/commit/b8ffbffaf771c259848743cf4eb1a5ea31795aaa))
* **portal:** hydration support for portal disabled mode ([b74bab2](https://github.com/vuejs/vue-next/commit/b74bab216c3be68ab046451cf5e5b5bec5f19483))
* **portal:** SSR support for multi portal shared target ([e866434](https://github.com/vuejs/vue-next/commit/e866434f0c54498dd0fc47d48287a1d0ada36388))
* **portal:** SSR support for portal disabled prop ([9ed9bf3](https://github.com/vuejs/vue-next/commit/9ed9bf3687a770aebc265839065832761e6bafa1))
* **portal:** support disabled prop ([8ce3da0](https://github.com/vuejs/vue-next/commit/8ce3da0104db9bdd89929724c6d841ac3dfb7336))
* **portal:** support multiple portal appending to same target ([aafb880](https://github.com/vuejs/vue-next/commit/aafb880a0a9e023b62cf8fb3ae269b31f22ac84e))
* **reactivity:** add effect to public api ([#909](https://github.com/vuejs/vue-next/issues/909)) ([6fba241](https://github.com/vuejs/vue-next/commit/6fba2418507d9c65891e8d14bd63736adb377556))
* **runtime-core:** config.performance tracing support ([e93e426](https://github.com/vuejs/vue-next/commit/e93e426bfad13f40c8f1d80b8f45ac5d0926c2fc))
* **runtime-core:** emits validation and warnings ([c7c3a6a](https://github.com/vuejs/vue-next/commit/c7c3a6a3bef6275be8f9f8873358421017bb5386))
* **runtime-core:** failed component resolution should fallback to native element ([cb31eb4](https://github.com/vuejs/vue-next/commit/cb31eb4d0a0afdd2abf9e3897d9aac447dd0264b))
* **runtime-core:** support app.config.globalProperties ([27873db](https://github.com/vuejs/vue-next/commit/27873dbe1c09ac6a058d815949a4e13831513fd0))
* **runtime-core:** type and attr fallthrough support for emits option ([bf473a6](https://github.com/vuejs/vue-next/commit/bf473a64eacab21d734d556c66cc190aa4ff902d))
* **templateRef:** should work with direct reactive property ([449ab03](https://github.com/vuejs/vue-next/commit/449ab039feb10df7179898b13ecc45028a043002)), closes [#901](https://github.com/vuejs/vue-next/issues/901)
* **templateRef:** support template ref for all vnode types ([55b364d](https://github.com/vuejs/vue-next/commit/55b364decc903a6c7fccd1cdcdcfc79948c848a2))


### BREAKING CHANGES

* **runtime-core:** attribute fallthrough behavior has been adjusted
according to https://github.com/vuejs/rfcs/pull/154
* `<portal>` has been renamed to `<teleport>`.

    `target` prop is also renamed to `to`, so the new usage will be:

    ```html
    <Teleport to="#modal-layer" :disabled="isMobile">
      <div class="modal">
        hello
      </div>
    </Teleport>
    ```

    The primary reason for the renaming is to avoid potential naming
    conflict with [native portals](https://wicg.github.io/portals/).
* **asyncComponent:** async component `error` and `loading` options have been
renamed to `errorComponent` and `loadingComponent` respectively.
* **runtime-core:** `createAsyncComponent` has been renamed to `defineAsyncComponent` for consistency with `defineComponent`.



# [3.0.0-alpha.10](https://github.com/vuejs/vue-next/compare/v3.0.0-alpha.9...v3.0.0-alpha.10) (2020-03-24)


### Bug Fixes

* fix option merge global mixins presence check ([10ad965](https://github.com/vuejs/vue-next/commit/10ad965100a88e28cb528690f2e09070fefc8872))
* **compiler-core:** assign patchFlag for template v-if fragment ([a1da9c2](https://github.com/vuejs/vue-next/commit/a1da9c28a0a7030124b1deb9369685760c67be47)), closes [#850](https://github.com/vuejs/vue-next/issues/850)
* **compiler-core:** support interpolation in RCDATA mode (e.g. textarea) ([0831b98](https://github.com/vuejs/vue-next/commit/0831b98eac344d9bdfd6f6e922902adb91ea180a))
* **keep-alive:** should update re-activated component with latest props ([1237387](https://github.com/vuejs/vue-next/commit/123738727a0af54fd632bf838dc3aa024722ee41))
* **reactivity:** should not observe frozen objects ([1b2149d](https://github.com/vuejs/vue-next/commit/1b2149dbb2dd224d01e90c1a9332bfe67aa465ce)), closes [#867](https://github.com/vuejs/vue-next/issues/867)
* **reactivity:** should not trigger map keys iteration when keys did not change ([45ba06a](https://github.com/vuejs/vue-next/commit/45ba06ac5f49876b4f05e5996f595b2c4a761f47)), closes [#877](https://github.com/vuejs/vue-next/issues/877)
* **runtime-core:** fix boolean props validation ([3b282e7](https://github.com/vuejs/vue-next/commit/3b282e7e3c96786af0a5ff61822882d1ed3f4db3))
* **runtime-dom:** invalid lineGradient svg tag ([#863](https://github.com/vuejs/vue-next/issues/863)) ([d425818](https://github.com/vuejs/vue-next/commit/d425818901428ff919a0179fc910410cbcfa119b)), closes [#862](https://github.com/vuejs/vue-next/issues/862)
* **TransitionGroup:** ignore comment node when warn (fix[#869](https://github.com/vuejs/vue-next/issues/869)) ([#875](https://github.com/vuejs/vue-next/issues/875)) ([0dba5d4](https://github.com/vuejs/vue-next/commit/0dba5d44e60d33b909f4e4d05663c7ddf746a1f2))
* do not drop SFC runtime behavior code in global builds ([4c1a193](https://github.com/vuejs/vue-next/commit/4c1a193617bee8ace6fad289b78e9d2557cb081e)), closes [#873](https://github.com/vuejs/vue-next/issues/873)
* dynamic component fallback to native element ([f529dbd](https://github.com/vuejs/vue-next/commit/f529dbde236e9eaedbded78e926951a189234f9c)), closes [#870](https://github.com/vuejs/vue-next/issues/870)
* **runtime-core:** fix component proxy props presence check ([b3890a9](https://github.com/vuejs/vue-next/commit/b3890a93e39342fd16e5fd72c59f361fc211309c)), closes [#864](https://github.com/vuejs/vue-next/issues/864)
* **suspense:** clear effects on suspense resolve ([ebc1ca8](https://github.com/vuejs/vue-next/commit/ebc1ca8eff82789987c09a9f6a934898b00153ff))
* **transition:** fix duration prop validation ([0dc2478](https://github.com/vuejs/vue-next/commit/0dc24785699101fa24d2a68786feaaac8a887520)), closes [#868](https://github.com/vuejs/vue-next/issues/868)


### Features

* **asyncComponent:** SSR/hydration support for async component ([cba2f1a](https://github.com/vuejs/vue-next/commit/cba2f1aadbd0d4ae246040ecd5a91d8dd4e8fd1a))
* **runtime-core:** async component support ([c3bb316](https://github.com/vuejs/vue-next/commit/c3bb3169f497fc834654d8ae700f18b1a6613127))
* **runtime-core:** support `config.optionMergeStrategies` ([528621b](https://github.com/vuejs/vue-next/commit/528621ba41b1d7113940077574217d01d182b35f))
* add hook for transforming h's arguments ([#851](https://github.com/vuejs/vue-next/issues/851)) ([b7d1e0f](https://github.com/vuejs/vue-next/commit/b7d1e0fa2ffe4561a589580eca6e92171c311347))


### Performance Improvements

* **transform-vif:** don't need to createBlock for a component ([#853](https://github.com/vuejs/vue-next/issues/853)) ([a3601e9](https://github.com/vuejs/vue-next/commit/a3601e9fa73d10f524ed3bdf3ae44df8847c1230))



# [3.0.0-alpha.9](https://github.com/vuejs/vue-next/compare/v3.0.0-alpha.8...v3.0.0-alpha.9) (2020-03-16)


### Bug Fixes

* **build:** remove __RUNTIME_COMPILE__ flag ([206640a](https://github.com/vuejs/vue-next/commit/206640a2d859a9ce9c19f22e201692f15a8d1da3)), closes [#817](https://github.com/vuejs/vue-next/issues/817)
* **compiler-core:** fix property shorthand detection ([586e5bb](https://github.com/vuejs/vue-next/commit/586e5bb8003916ba6be9b3394087df80328657f4)), closes [#845](https://github.com/vuejs/vue-next/issues/845)
* **compiler-ssr:** fix input w/ v-bind="obj" codegen ([3b40fc5](https://github.com/vuejs/vue-next/commit/3b40fc56dba56a5c1085582d11f3287e9317a151))
* **compiler-ssr:** should pass necessary tag names for dynamic v-bind ([a46f3b3](https://github.com/vuejs/vue-next/commit/a46f3b354d451a857df750a318bd0536338008cd))
* **runtime-core:** always set invalid vnode type ([#820](https://github.com/vuejs/vue-next/issues/820)) ([28a9bee](https://github.com/vuejs/vue-next/commit/28a9beed1624de9812e0f4ce9b63f7f3ed2c6db8))
* **runtime-core:** empty boolean props ([#844](https://github.com/vuejs/vue-next/issues/844)) ([c7ae269](https://github.com/vuejs/vue-next/commit/c7ae2699724bd5206ce7d2db73b86c1ef5947641)), closes [#843](https://github.com/vuejs/vue-next/issues/843)
* **runtime-core:** pass instance proxy as data() argument ([#828](https://github.com/vuejs/vue-next/issues/828)) ([d9dd1d8](https://github.com/vuejs/vue-next/commit/d9dd1d8a0ac81d7d463e0788bb2e75b2d4866db6))
* **runtime-dom:** patch xlink attribute ([#842](https://github.com/vuejs/vue-next/issues/842)) ([d318576](https://github.com/vuejs/vue-next/commit/d318576d74f8756e471942ff44d2af2a4661d775))
* simplify and use correct ctx in withCtx ([4dc8ffc](https://github.com/vuejs/vue-next/commit/4dc8ffc3788c38aff3e4c0f271d0ca111f723140))
* **runtime-core:** pass prev value to hostPatchProp ([#809](https://github.com/vuejs/vue-next/issues/809)) ([cd34603](https://github.com/vuejs/vue-next/commit/cd34603864142d5468486ec3f379679b22014a1b)), closes [#808](https://github.com/vuejs/vue-next/issues/808)
* **runtime-core:** should allow empty string and 0 as valid vnode key ([#807](https://github.com/vuejs/vue-next/issues/807)) ([54a0e93](https://github.com/vuejs/vue-next/commit/54a0e93c276f95a35b3bd6510a7f52d967fd3b7f))
* **types:** app.component should accept defineComponent return type ([#822](https://github.com/vuejs/vue-next/issues/822)) ([1e9d131](https://github.com/vuejs/vue-next/commit/1e9d1319c3f66a0a7430a4f6ac7b508486894b6b)), closes [#730](https://github.com/vuejs/vue-next/issues/730)


### Code Refactoring

* **runtime-core:** adjust patchProp value arguments order ([ca5f39e](https://github.com/vuejs/vue-next/commit/ca5f39ee3501a1d9cacdb74108318c15ee7c0abb))


### Features

* **compiler-core:** wrap slot functions with render context ([ecd7ce6](https://github.com/vuejs/vue-next/commit/ecd7ce60d5234a7a0dbc11add6a690c3f9ff0617))
* **compiler-sfc:** add ssr option ([3b2d236](https://github.com/vuejs/vue-next/commit/3b2d23671409f8ac358252311bf5212882fa985a))
* **runtime-core:** add special property to get class component options ([#821](https://github.com/vuejs/vue-next/issues/821)) ([dd17fa1](https://github.com/vuejs/vue-next/commit/dd17fa1c9071b9685c379e1b12102214b757cf35))
* **runtime-core:** implement RFC-0020 ([bb7fa3d](https://github.com/vuejs/vue-next/commit/bb7fa3dabce73de63d016c75f1477e7d8bed8858))
* **runtime-core:** set context for manual slot functions as well ([8a58dce](https://github.com/vuejs/vue-next/commit/8a58dce6034944b18c2e507b5d9ab8177f60e269))
* **server-renderer:** render suspense in vnode mode ([#727](https://github.com/vuejs/vue-next/issues/727)) ([589aeb4](https://github.com/vuejs/vue-next/commit/589aeb402c58f463cc32d5e7728b56614bc9bf33))
* **ssr:** compiler-ssr support for Suspense ([80c625d](https://github.com/vuejs/vue-next/commit/80c625dce33610e53c953e9fb8fde26e3e10e358))
* **ssr:** hide comment anchors during hydration in dev mode ([cad5bcc](https://github.com/vuejs/vue-next/commit/cad5bcce40b9f2aaa520ccbd377cd5419650e55f))
* **ssr:** improve fragment mismatch handling ([60ed4e7](https://github.com/vuejs/vue-next/commit/60ed4e7e0821a2932660b87fbf8d5ca953e0e073))
* **ssr:** support getSSRProps for vnode directives ([c450ede](https://github.com/vuejs/vue-next/commit/c450ede12d1a93a70271a2fe7fcb6f8efcf1cd4c))
* **ssr/suspense:** suspense hydration ([a3cc970](https://github.com/vuejs/vue-next/commit/a3cc970030579f2c55d893d6e83bbc05324adad4))
* **types:** export `ErrorTypes` ([#840](https://github.com/vuejs/vue-next/issues/840)) ([760c3e0](https://github.com/vuejs/vue-next/commit/760c3e0fd67f6360995cdbb125f9eae4e024f3af))


### Reverts

* Revert "refactor(directives): remove binding.instance" ([2370166](https://github.com/vuejs/vue-next/commit/23701666cb487e55d05b74d66990361051715ba4))


### BREAKING CHANGES

* **runtime-core:** data no longer supports object format (per RFC-0020)
* **runtime-core:** `RendererOptions.patchProp` arguments order has changed

  The `prevValue` and `nextValue` position has been swapped to keep it
  consistent with other functions in the renderer implementation. This
  only affects custom renderers using the `createRenderer` API.



# [3.0.0-alpha.8](https://github.com/vuejs/vue-next/compare/v3.0.0-alpha.7...v3.0.0-alpha.8) (2020-03-06)


### Bug Fixes

* **directives:** ignore invalid directive hooks ([7971b04](https://github.com/vuejs/vue-next/commit/7971b0468c81483dd7026204518f7c03187d13c4)), closes [#795](https://github.com/vuejs/vue-next/issues/795)
* **portal:** fix portal placeholder text ([4397528](https://github.com/vuejs/vue-next/commit/439752822c175c737e58896e0f365f2b02bab577))
* **reactivity:** allow effect trigger inside no-track execution contexts ([274f81c](https://github.com/vuejs/vue-next/commit/274f81c5db83f0f77e1aba3240b2134a2474a72f)), closes [#804](https://github.com/vuejs/vue-next/issues/804)
* **reactivity:** Map/Set identity methods should work even if raw value contains reactive entries ([cc69fd7](https://github.com/vuejs/vue-next/commit/cc69fd72e3f9ef3572d2be40af71d22232e1b9af)), closes [#799](https://github.com/vuejs/vue-next/issues/799)
* **reactivity:** should not trigger length dependency on Array delete ([a306658](https://github.com/vuejs/vue-next/commit/a3066581f3014aae31f2d96b96428100f1674166)), closes [#774](https://github.com/vuejs/vue-next/issues/774)
* **runtime-core:** ensure inherited attrs update on optimized child root ([6810d14](https://github.com/vuejs/vue-next/commit/6810d1402e214a12fa274ff5fb7475bad002d1b1)), closes [#677](https://github.com/vuejs/vue-next/issues/677) [#784](https://github.com/vuejs/vue-next/issues/784)
* **slots:** fix conditional slot ([3357ff4](https://github.com/vuejs/vue-next/commit/3357ff438c6ff0d4fea67923724dd3cb99ff2756)), closes [#787](https://github.com/vuejs/vue-next/issues/787)
* **ssr:** fix ssr on-the-fly compilation + slot fallback branch helper injection ([3be3785](https://github.com/vuejs/vue-next/commit/3be3785f945253918469da456a14a2d9381bcbd0))


### Code Refactoring

* **runtime-core:** adjust attr fallthrough behavior ([e1660f4](https://github.com/vuejs/vue-next/commit/e1660f4338fbf4d2a434e13193a58e00f844379b)), closes [#749](https://github.com/vuejs/vue-next/issues/749)
* **runtime-core:** revert setup() result reactive conversion ([e67f655](https://github.com/vuejs/vue-next/commit/e67f655b2687042fcc74dc0993581405abed56de))


### Features

* **compiler-core:** switch to @babel/parser for expression parsing ([8449a97](https://github.com/vuejs/vue-next/commit/8449a9727c942b6049c9e577c7c15b43fdca2867))
* **compiler-ssr:** compile portal ([#775](https://github.com/vuejs/vue-next/issues/775)) ([d8ed0e7](https://github.com/vuejs/vue-next/commit/d8ed0e7fbf9bbe734667eb94e809235e79e431eb))
* **ssr:** hydration mismatch handling ([91269da](https://github.com/vuejs/vue-next/commit/91269da52c30abf6c50312555b715f5360224bb0))


### BREAKING CHANGES

* **runtime-core:** adjust attr fallthrough behavior

    Updated per pending RFC https://github.com/vuejs/rfcs/pull/137

    - Implicit fallthrough now by default only applies for a whitelist
      of attributes (class, style, event listeners, a11y attributes, and
      data attributes).

    - Fallthrough is now applied regardless of whether the component has
* **runtime-core:** revert setup() result reactive conversion

    Revert 6b10f0c & a840e7d. The motivation of the original change was
    avoiding unnecessary deep conversions, but that can be achieved by
    explicitly marking values non-reactive via `markNonReactive`.

    Removing the reactive conversion behavior leads to an usability
    issue in that plain objects containing refs (which is what most
    composition functions will return), when exposed as a nested
    property from `setup()`, will not unwrap the refs in templates. This
    goes against the "no .value in template" intuition and the only
    workaround requires users to manually wrap it again with `reactive()`.

    So in this commit we are reverting to the previous behavior where
    objects returned from `setup()` are implicitly wrapped with
    `reactive()` for deep ref unwrapping.



# [3.0.0-alpha.7](https://github.com/vuejs/vue-next/compare/v3.0.0-alpha.6...v3.0.0-alpha.7) (2020-02-26)


### Bug Fixes

* **renderSlot:** set slot render as a STABLE_FRAGMENT ([#776](https://github.com/vuejs/vue-next/issues/776)) ([8cb0b83](https://github.com/vuejs/vue-next/commit/8cb0b8308801159177ec16ab5a3e23672c4c1d00)), closes [#766](https://github.com/vuejs/vue-next/issues/766)
* **runtime-core:** fix slot fallback + slots typing ([4a5b91b](https://github.com/vuejs/vue-next/commit/4a5b91bd1faec76bbaa0522b095f4a07ca88a9e5)), closes [#773](https://github.com/vuejs/vue-next/issues/773)
* **runtime-core:** make watchEffect ignore deep option ([#765](https://github.com/vuejs/vue-next/issues/765)) ([19a799c](https://github.com/vuejs/vue-next/commit/19a799c28b149b14e85d9e2081fa65ed58d108ba))
* **runtime-core:** set appContext.provides to Object.create(null) ([#781](https://github.com/vuejs/vue-next/issues/781)) ([04f83fa](https://github.com/vuejs/vue-next/commit/04f83fa6810e07915e98b94c954ff0c1859aaa49))
* **template-explorer:** rename watch -> watchEffect ([#780](https://github.com/vuejs/vue-next/issues/780)) ([59393dd](https://github.com/vuejs/vue-next/commit/59393dd75766720330cb69e22086c97a392dbbe4))
* **template-ref:** fix string template refs inside slots ([3eab143](https://github.com/vuejs/vue-next/commit/3eab1438432a3bab15ccf2f6092fc3e4355f3cdd))
* **types:** ref value type unwrapping should happen at creation time ([d4c6957](https://github.com/vuejs/vue-next/commit/d4c6957e2d8ac7920a649f3a3576689cd5e1099f))
* **types:** shallowRef should not unwrap value type ([3206e5d](https://github.com/vuejs/vue-next/commit/3206e5dfe58fd0e93644d13929558d71c5171888))


### Code Refactoring

* **directives:** remove binding.instance ([52cc7e8](https://github.com/vuejs/vue-next/commit/52cc7e823148289b3dcdcb6b521984ab815fce79))


### BREAKING CHANGES

* **directives:** custom directive bindings no longer expose instance

    This is a rarely used property that creates extra complexity in
    ensuring it points to the correct instance. From a design
    perspective, a custom directive should be scoped to the element and
    data it is bound to and should not have access to the entire
    instance in the first place.



# [3.0.0-alpha.6](https://github.com/vuejs/vue-next/compare/v3.0.0-alpha.5...v3.0.0-alpha.6) (2020-02-22)


### Bug Fixes

* **compiler-core:** should alias name in helperString ([#743](https://github.com/vuejs/vue-next/issues/743)) ([7b987d9](https://github.com/vuejs/vue-next/commit/7b987d9450fc7befcd0946a0d53991d27ed299ec)), closes [#740](https://github.com/vuejs/vue-next/issues/740)
* **compiler-dom:** properly stringify class/style bindings when hoisting static strings ([1b9b235](https://github.com/vuejs/vue-next/commit/1b9b235663b75db040172d2ffbee1dd40b4db032))
* **reactivity:** should trigger all effects when array length is mutated ([#754](https://github.com/vuejs/vue-next/issues/754)) ([5fac655](https://github.com/vuejs/vue-next/commit/5fac65589b4455b98fd4e2f9eb3754f0acde97bb))
* **sfc:** inherit parent scopeId on child root ([#756](https://github.com/vuejs/vue-next/issues/756)) ([9547c2b](https://github.com/vuejs/vue-next/commit/9547c2b93d6d8f469314cfe055960746a3e3acbe))
* **types:** improve ref typing, close [#759](https://github.com/vuejs/vue-next/issues/759) ([627b9df](https://github.com/vuejs/vue-next/commit/627b9df4a293ae18071009d9cac7a5e995d40716))
* **types:** update setup binding unwrap types for 6b10f0c ([a840e7d](https://github.com/vuejs/vue-next/commit/a840e7ddf0b470b5da27b7b2b8b5fcf39a7197a2)), closes [#738](https://github.com/vuejs/vue-next/issues/738)


### Code Refactoring

* preserve refs in reactive arrays ([775a7c2](https://github.com/vuejs/vue-next/commit/775a7c2b414ca44d4684badb29e8e80ff6b5d3dd)), closes [#737](https://github.com/vuejs/vue-next/issues/737)


### Features

* **reactivity:** expose unref and shallowRef ([e9024bf](https://github.com/vuejs/vue-next/commit/e9024bf1b7456b9cf9b913c239502593364bc773))
* **runtime-core:** add watchEffect API ([99a2e18](https://github.com/vuejs/vue-next/commit/99a2e18c9711d3d1f79f8c9c59212880efd058b9))


### Performance Improvements

* **effect:** optimize effect trigger for array length mutation ([#761](https://github.com/vuejs/vue-next/issues/761)) ([76c7f54](https://github.com/vuejs/vue-next/commit/76c7f5426919f9d29a303263bc54a1e42a66e94b))
* **reactivity:** only trigger all effects on Array length mutation if new length is shorter than old length ([33622d6](https://github.com/vuejs/vue-next/commit/33622d63600ba0f18ba4dae97bda882c918b5f7d))


### BREAKING CHANGES

* **runtime-core:** replace `watch(fn, options?)` with `watchEffect`

    The `watch(fn, options?)` signature has been replaced by the new
    `watchEffect` API, which has the same usage and behavior. `watch`
    now only supports the `watch(source, cb, options?)` signature.

* **reactivity:** reactive arrays no longer unwraps contained refs

    When reactive arrays contain refs, especially a mix of refs and
    plain values, Array prototype methods will fail to function
    properly - e.g. sort() or reverse() will overwrite the ref's value
    instead of moving it (see #737).

    Ensuring correct behavior for all possible Array methods while
    retaining the ref unwrapping behavior is exceedingly complicated; In
    addition, even if Vue handles the built-in methods internally, it
    would still break when the user attempts to use a 3rd party utility
    function (e.g. lodash) on a reactive array containing refs.

    After this commit, similar to other collection types like Map and
    Set, Arrays will no longer automatically unwrap contained refs.

    The usage of mixed refs and plain values in Arrays should be rare in
    practice. In cases where this is necessary, the user can create a
    computed property that performs the unwrapping.



# [3.0.0-alpha.5](https://github.com/vuejs/vue-next/compare/v3.0.0-alpha.4...v3.0.0-alpha.5) (2020-02-18)


### Bug Fixes

* **compiler:** fix v-for fragment openBlock argument ([12fcf9a](https://github.com/vuejs/vue-next/commit/12fcf9ab953acdbb8706b549c7e63f69482a495a))
* **compiler-core:** fix keep-alive when used in templates ([ade07c6](https://github.com/vuejs/vue-next/commit/ade07c64a1f98c0958e80db0458c699c21998f64)), closes [#715](https://github.com/vuejs/vue-next/issues/715)
* **compiler-core:** only check is prop on `<component>` ([78c4f32](https://github.com/vuejs/vue-next/commit/78c4f321cd0902a117c599ac705dda294fa198ed))
* **compiler-core:** relax error on unknown entities ([730d329](https://github.com/vuejs/vue-next/commit/730d329f794caf1ea2cc47628f8d74ef2d07f96e)), closes [#663](https://github.com/vuejs/vue-next/issues/663)
* **compiler-core:** should apply text transform to if branches ([e0f3c6b](https://github.com/vuejs/vue-next/commit/e0f3c6b352ab35adcad779ef0ac9670acf3d7b37)), closes [#725](https://github.com/vuejs/vue-next/issues/725)
* **compiler-core:** should not hoist element with cached + merged event handlers ([5455e8e](https://github.com/vuejs/vue-next/commit/5455e8e69a59cd1ff72330b1aed9c8e6aedc4b36))
* **compiler-dom:** fix duplicated transforms ([9e51297](https://github.com/vuejs/vue-next/commit/9e51297702f975ced1cfebad9a46afc46f0593bb))
* **compiler-sfc:** handle empty nodes with src attribute ([#695](https://github.com/vuejs/vue-next/issues/695)) ([2d56dfd](https://github.com/vuejs/vue-next/commit/2d56dfdc4fcf824bba4c0166ca5471258c4f883b))
* **compiler-ssr:** import helpers from correct packages ([8f6b669](https://github.com/vuejs/vue-next/commit/8f6b6690a2011846446804267ec49073996c3800))
* **computed:** support arrow function usage for computed option ([2fb7a63](https://github.com/vuejs/vue-next/commit/2fb7a63943d9d995248cb6d2d4fb5f22ff2ac000)), closes [#733](https://github.com/vuejs/vue-next/issues/733)
* **reactivity:** avoid cross-component dependency leaks in setup() ([d9d63f2](https://github.com/vuejs/vue-next/commit/d9d63f21b1e6f99f2fb63d736501095b131e5ad9))
* **reactivity:** effect should handle self dependency mutations ([e8e6772](https://github.com/vuejs/vue-next/commit/e8e67729cb7649d736be233b2a5e00768dd6f4ba))
* **reactivity:** trigger iteration effect on Map.set ([e1c9153](https://github.com/vuejs/vue-next/commit/e1c9153b9ed71f9b2e1ad4f9018c51d239e7dcd0)), closes [#709](https://github.com/vuejs/vue-next/issues/709)
* **runtime-core:** ensure renderCache always exists ([8383e54](https://github.com/vuejs/vue-next/commit/8383e5450e4f9679ac8a284f1c3960e3ee5b5211))
* **runtime-core:** fix keep-alive tree-shaking ([5b43764](https://github.com/vuejs/vue-next/commit/5b43764eacb59ff6ebba3195a55af4ac0cf253bb))
* **runtime-core:** fix ShapeFlags tree shaking ([0f67aa7](https://github.com/vuejs/vue-next/commit/0f67aa7da50d6ffc543754a42f1e677af11f9173))
* **runtime-core:** handle component updates with only class/style bindings ([35d91f4](https://github.com/vuejs/vue-next/commit/35d91f4e18ccb72cbf39a86fe8f39060f0bf075e))
* **runtime-core:** render context set should not unwrap reactive values ([27fbfbd](https://github.com/vuejs/vue-next/commit/27fbfbdb8beffc96134c931425f33178c23a72db))
* **runtime-core:** rework vnode hooks handling ([cfadb98](https://github.com/vuejs/vue-next/commit/cfadb98011e188114bb822ee6f678cd09ddac7e3)), closes [#684](https://github.com/vuejs/vue-next/issues/684)
* **runtime-core:** should not return early on text patchFlag ([778f3a5](https://github.com/vuejs/vue-next/commit/778f3a5e886a1a1136bc8b00b849370d7c4041be))
* **runtime-core/scheduler:** avoid duplicate updates of child component ([8a87074](https://github.com/vuejs/vue-next/commit/8a87074df013fdbb0e88f34074c2605e4af2937c))
* **runtime-core/scheduler:** invalidate job ([#717](https://github.com/vuejs/vue-next/issues/717)) ([fe9da2d](https://github.com/vuejs/vue-next/commit/fe9da2d0e4f9b338252b1b62941ee9ead71f0346))
* **runtime-core/watch:** trigger watcher with undefined as initial value ([#687](https://github.com/vuejs/vue-next/issues/687)) ([5742a0b](https://github.com/vuejs/vue-next/commit/5742a0b826fe77d2310acb530667adb758822f66)), closes [#683](https://github.com/vuejs/vue-next/issues/683)
* **runtime-dom/ssr:** properly handle xlink and boolean attributes ([e6e2c58](https://github.com/vuejs/vue-next/commit/e6e2c58234cab46fa530c383c0f7ae1cb3494da3))
* **ssr:** avoid hard-coded ssr checks in cjs builds ([bc07e95](https://github.com/vuejs/vue-next/commit/bc07e95ca84686bfa43798a444a3220581b183d8))
* **ssr:** fix class/style rendering + ssrRenderComponent export name ([688ad92](https://github.com/vuejs/vue-next/commit/688ad9239105625f7b63ac43181dfb2e9d1d4720))
* **ssr:** render components returning render function from setup ([#720](https://github.com/vuejs/vue-next/issues/720)) ([4669215](https://github.com/vuejs/vue-next/commit/4669215ca2f82d90a1bd730613259f3167e199cd))
* **transition-group:** handle multiple move-classes ([#679](https://github.com/vuejs/vue-next/issues/679)) ([5495c70](https://github.com/vuejs/vue-next/commit/5495c70c4a3f740ef4ac575ffee5466ca747cca1)), closes [#678](https://github.com/vuejs/vue-next/issues/678)
* **types:** app.component should accept defineComponent return type ([57ee5df](https://github.com/vuejs/vue-next/commit/57ee5df364f03816e548f4f3bf05edc7a089c362)), closes [#730](https://github.com/vuejs/vue-next/issues/730)
* **types:** ensure correct oldValue typing based on lazy option ([c6a9787](https://github.com/vuejs/vue-next/commit/c6a9787941ca99877d268182a5bb57fcf8b80b75)), closes [#719](https://github.com/vuejs/vue-next/issues/719)
* **v-on:** transform click.right and click.middle modifiers ([028f748](https://github.com/vuejs/vue-next/commit/028f748c32f80842be39897fdacc37f6700f00a7)), closes [#735](https://github.com/vuejs/vue-next/issues/735)
* remove effect from public API ([4bc4cb9](https://github.com/vuejs/vue-next/commit/4bc4cb970f7a65177948c5d817bb43ecb0324636)), closes [#712](https://github.com/vuejs/vue-next/issues/712)
* **v-model:** should use dynamic directive on input with dynamic v-bind ([1f2de9e](https://github.com/vuejs/vue-next/commit/1f2de9e232409b09c97b67d0824d1450beed6eb1))


### Code Refactoring

* **watch:** adjust watch API behavior ([9571ede](https://github.com/vuejs/vue-next/commit/9571ede84bb6949e13c25807cc8f016ace29dc8a))


### Features

* **compiler:** mark hoisted trees with patchFlag ([175f8aa](https://github.com/vuejs/vue-next/commit/175f8aae8d009e044e3674f7647bf1397f3a794a))
* **compiler:** warn invalid children for transition and keep-alive ([4cc39e1](https://github.com/vuejs/vue-next/commit/4cc39e14a297f42230f5aac5ec08e3c98902b98d))
* **compiler-core:** support mode: cjs in codegen ([04da2a8](https://github.com/vuejs/vue-next/commit/04da2a82e8fbde2b60b2392bc4bdcc5e61113202))
* **compiler-core/v-on:** support [@vnode-xxx](https://github.com/vnode-xxx) usage for vnode hooks ([571ed42](https://github.com/vuejs/vue-next/commit/571ed4226be618dcc9f95e4c2da8d82d7d2f7750))
* **compiler-dom:** handle constant expressions when stringifying static content ([8b7c162](https://github.com/vuejs/vue-next/commit/8b7c162125cb72068727a76ede8afa2896251db0))
* **compiler-dom/runtime-dom:** stringify eligible static trees ([27913e6](https://github.com/vuejs/vue-next/commit/27913e661ac551f580bd5fd42b49fe55cbe8dbb8))
* **reactivity:** add shallowReactive function ([#689](https://github.com/vuejs/vue-next/issues/689)) ([7f38c1e](https://github.com/vuejs/vue-next/commit/7f38c1e0ff5a7591f67ed21aa3a2944db2e72a27))
* **runtime-core/reactivity:** expose shallowReactive ([#711](https://github.com/vuejs/vue-next/issues/711)) ([21944c4](https://github.com/vuejs/vue-next/commit/21944c4a42a65f20245794fa5f07add579b7121f))
* **server-renderer:** support on-the-fly template compilation ([#707](https://github.com/vuejs/vue-next/issues/707)) ([6d10a6c](https://github.com/vuejs/vue-next/commit/6d10a6c77242aec98103f15d6cb672ba63c18abf))
* **ssr:** render portals ([#714](https://github.com/vuejs/vue-next/issues/714)) ([e495fa4](https://github.com/vuejs/vue-next/commit/e495fa4a1872d03ed59252e7ed5dd2b708adb7ae))
* **ssr:** support portal hydration ([70dc3e3](https://github.com/vuejs/vue-next/commit/70dc3e3ae74f08d53243e6f078794c16f359e272))
* **ssr:** useSSRContext ([fd03149](https://github.com/vuejs/vue-next/commit/fd031490fb89b7c0d1d478b586151a24324101a3))


### Performance Improvements

* prevent renderer hot functions being inlined by minifiers ([629ee75](https://github.com/vuejs/vue-next/commit/629ee75588fc2ca4ab2b3786046f788d3547b6bc))
* **reactivity:** better computed tracking ([#710](https://github.com/vuejs/vue-next/issues/710)) ([8874b21](https://github.com/vuejs/vue-next/commit/8874b21a7e2383a8bb6c15a7095c1853aa5ae705))


### BREAKING CHANGES

* **watch:** `watch` behavior has been adjusted.

    - When using the `watch(source, callback, options?)` signature, the
      callback now fires lazily by default (consistent with 2.x
      behavior).

      Note that the `watch(effect, options?)` signature is still eager,
      since it must invoke the `effect` immediately to collect
      dependencies.

    - The `lazy` option has been replaced by the opposite `immediate`
      option, which defaults to `false`. (It's ignored when using the
      effect signature)

    - Due to the above changes, the `watch` option in Options API now
      behaves exactly the same as 2.x.

    - When using the effect signature or `{ immediate: true }`, the
      initial execution is now performed synchronously instead of
      deferred until the component is mounted. This is necessary for
      certain use cases to work properly with `async setup()` and
      Suspense.

      The side effect of this is the immediate watcher invocation will
      no longer have access to the mounted DOM. However, the watcher can
      be initiated inside `onMounted` to retain previous behavior.



# [3.0.0-alpha.4](https://github.com/vuejs/vue-next/compare/v3.0.0-alpha.3...v3.0.0-alpha.4) (2020-01-27)


### Bug Fixes

* **reactivity:** Array methods relying on identity should work with raw values ([aefb7d2](https://github.com/vuejs/vue-next/commit/aefb7d282ed716923ca1a288a63a83a94af87ebc))
* **runtime-core:** instance should not expose non-declared props ([2884831](https://github.com/vuejs/vue-next/commit/2884831065e16ccf5bd3ae1ee95116803ee3b18c))
* **runtime-dom:** should not access document in non-browser env ([48152bc](https://github.com/vuejs/vue-next/commit/48152bc88ea817ae23e2987dce99d64b426366c1)), closes [#657](https://github.com/vuejs/vue-next/issues/657)
* **v-model/emit:** update:camelCase events should trigger kebab case equivalent ([2837ce8](https://github.com/vuejs/vue-next/commit/2837ce842856d51dfbb55e3fa4a36a352446fb54)), closes [#656](https://github.com/vuejs/vue-next/issues/656)


### Code Refactoring

* adjust `createApp` related API signatures ([c07751f](https://github.com/vuejs/vue-next/commit/c07751fd3605f301dc0f02fd2a48acc7ba7a0397))
* remove implicit reactive() call on renderContext ([6b10f0c](https://github.com/vuejs/vue-next/commit/6b10f0cd1da942c1d96746672b5f595df7d125b5))


### Performance Improvements

* **ssr:** avoid unnecessary async overhead ([297282a](https://github.com/vuejs/vue-next/commit/297282a81259289bfed207d0c9393337aea70117))


### BREAKING CHANGES

* object returned from `setup()` are no longer implicitly
passed to `reactive()`.

  The renderContext is the object returned by `setup()` (or a new object
  if no setup() is present). Before this change, it was implicitly passed
  to `reactive()` for ref unwrapping. But this has the side effect of
  unnecessary deep reactive conversion on properties that should not be
  made reactive (e.g. computed return values and injected non-reactive
  objects), and can lead to performance issues.

  This change removes the `reactive()` call and instead performs a
  shallow ref unwrapping at the render proxy level. The breaking part is
  when the user returns an object with a plain property from `setup()`,
  e.g. `return { count: 0 }`, this property will no longer trigger
  updates when mutated by a in-template event handler. Instead, explicit
  refs are required.

  This also means that any objects not explicitly made reactive in
  `setup()` will remain non-reactive. This can be desirable when
  exposing heavy external stateful objects on `this`.
* `createApp` API has been adjusted.

  - `createApp()` now accepts the root component, and optionally a props
  object to pass to the root component.
  - `app.mount()` now accepts a single argument (the root container)
  - `app.unmount()` no longer requires arguments.

  New behavior looks like the following:

  ``` js
  const app = createApp(RootComponent)
  app.mount('#app')
  app.unmount()
  ```



# [3.0.0-alpha.3](https://github.com/vuejs/vue-next/compare/v3.0.0-alpha.2...v3.0.0-alpha.3) (2020-01-22)


### Bug Fixes

* Suspense should include into dynamic children ([#653](https://github.com/vuejs/vue-next/issues/653)) ([ec63623](https://github.com/vuejs/vue-next/commit/ec63623fe8d395e1cd759f27b90b1ccc1b616931)), closes [#649](https://github.com/vuejs/vue-next/issues/649)
* **compiler-core:** avoid override user keys when injecting branch key ([#630](https://github.com/vuejs/vue-next/issues/630)) ([aca2c2a](https://github.com/vuejs/vue-next/commit/aca2c2a81e2793befce516378a02afd1e4da3d3d))
* **compiler-core:** force `<svg>` into blocks for correct runtime isSVG ([f2ac28b](https://github.com/vuejs/vue-next/commit/f2ac28b31e9f1e8ebcd68ca9a1e8ea29653b0916))
* **compiler-sfc:** only transform relative asset URLs ([#628](https://github.com/vuejs/vue-next/issues/628)) ([c71ca35](https://github.com/vuejs/vue-next/commit/c71ca354b9368135b55676c5817cebffaf3fd9c5))
* **dom:** fix `<svg>` and `<foreignObject>` mount and updates ([4f06eeb](https://github.com/vuejs/vue-next/commit/4f06eebc1c2a29d0e4165c6e87f849732ec2cd0f))
* **runtime-core:** condition for parent node check should be any different nodes ([c35fea3](https://github.com/vuejs/vue-next/commit/c35fea3d608acbb571ace6693284061e1cadf7ba)), closes [#622](https://github.com/vuejs/vue-next/issues/622)
* **runtime-core:** isSVG check should also apply for patch branch ([035b656](https://github.com/vuejs/vue-next/commit/035b6560f7eb64ce940ed0d06e19086ad9a3890f)), closes [#639](https://github.com/vuejs/vue-next/issues/639)
* **runtime-core:** should not warn unused attrs when accessed via setup context ([751d838](https://github.com/vuejs/vue-next/commit/751d838fb963e580a40df2d84840ba2198480185)), closes [#625](https://github.com/vuejs/vue-next/issues/625)
* **transition:** handle multiple transition classes ([#638](https://github.com/vuejs/vue-next/issues/638)) ([#645](https://github.com/vuejs/vue-next/issues/645)) ([98d50d8](https://github.com/vuejs/vue-next/commit/98d50d874dcb32a246216b936e442e5b95ab4825))


### Features

* **runtime-core:** emit now returns array of return values from all triggered handlers ([e81c8a3](https://github.com/vuejs/vue-next/commit/e81c8a32c7b66211cbaecffa93efd4629ec45ad9)), closes [#635](https://github.com/vuejs/vue-next/issues/635)
* **runtime-core:** support app.unmount(container) ([#601](https://github.com/vuejs/vue-next/issues/601)) ([04ac6c4](https://github.com/vuejs/vue-next/commit/04ac6c467a4122877c204d7494c86f89498d2dc6)), closes [#593](https://github.com/vuejs/vue-next/issues/593)



# [3.0.0-alpha.2](https://github.com/vuejs/vue-next/compare/v3.0.0-alpha.1...v3.0.0-alpha.2) (2020-01-13)


### Bug Fixes

* **compiler/v-on:** handle multiple statements in v-on handler (close [#572](https://github.com/vuejs/vue-next/issues/572)) ([137893a](https://github.com/vuejs/vue-next/commit/137893a4fdd3d2b901adca31e30d916df925b108))
* **compiler/v-slot:** handle implicit default slot mixed with named slots ([2ac4b72](https://github.com/vuejs/vue-next/commit/2ac4b723e010082488b5be64af73e41c9677a28d))
* **reactivity:** should delete observe value ([#598](https://github.com/vuejs/vue-next/issues/598)) ([63a6563](https://github.com/vuejs/vue-next/commit/63a656310676e3927b2e57d813fd6300c0a42590)), closes [#597](https://github.com/vuejs/vue-next/issues/597)
* **runtime-core:** allow classes to be passed as plugins ([#588](https://github.com/vuejs/vue-next/issues/588)) ([8f616a8](https://github.com/vuejs/vue-next/commit/8f616a89c580bc211540d5e4d60488ff24d024cc))
* **runtime-core:** should preserve props casing when component has no declared props ([bb6a346](https://github.com/vuejs/vue-next/commit/bb6a346996ce0bf05596c605ba5ddbe0743ef84b)), closes [#583](https://github.com/vuejs/vue-next/issues/583)
* **runtime-core/renderer:** fix v-if toggle inside blocks ([2e9726e](https://github.com/vuejs/vue-next/commit/2e9726e6a219d546cd28e4ed42be64719708f047)), closes [#604](https://github.com/vuejs/vue-next/issues/604) [#607](https://github.com/vuejs/vue-next/issues/607)
* **runtime-core/vnode:** should not render boolean values in vnode children (close [#574](https://github.com/vuejs/vue-next/issues/574)) ([84dc5a6](https://github.com/vuejs/vue-next/commit/84dc5a686275528733977ea1570e0a892ba3e177))
* **types:** components options should accept components defined with defineComponent ([#602](https://github.com/vuejs/vue-next/issues/602)) ([74baea1](https://github.com/vuejs/vue-next/commit/74baea108aa93377c4959f9a6b8bc8f9548700ba))
* **watch:** remove recorded effect on manual stop ([#590](https://github.com/vuejs/vue-next/issues/590)) ([453e688](https://github.com/vuejs/vue-next/commit/453e6889da22e7224b638261a32438bdf5c62e41))



# [3.0.0-alpha.1](https://github.com/vuejs/vue-next/compare/v3.0.0-alpha.0...v3.0.0-alpha.1) (2020-01-02)


### Bug Fixes

* **runtime-core:** pass options to plugins ([#561](https://github.com/vuejs/vue-next/issues/561)) ([4d20981](https://github.com/vuejs/vue-next/commit/4d20981eb069b20e1627916b977aedb2d68eca86))
* **sfc:** treat custom block content as raw text ([d6275a3](https://github.com/vuejs/vue-next/commit/d6275a3c310e6e9426f897afe35ff6cdb125c023))
* mounting new children ([7d436ab](https://github.com/vuejs/vue-next/commit/7d436ab59a30562a049e199ae579df7ac8066829))
* **core:** clone mounted hoisted vnodes on patch ([47a6a84](https://github.com/vuejs/vue-next/commit/47a6a846311203fa59584486265f5da387afa51d))
* **fragment:** perform direct remove when removing fragments ([2fdb499](https://github.com/vuejs/vue-next/commit/2fdb499bd96b4d1a8a7a1964d59e8dc5dacd9d22))


### Features

* **hmr:** root instance reload ([eda495e](https://github.com/vuejs/vue-next/commit/eda495efd824f17095728a4d2a6db85ca874e5ca))


### Performance Improvements

* **compiler-core:** simplify `advancePositionWithMutation` ([#564](https://github.com/vuejs/vue-next/issues/564)) ([ad2a0bd](https://github.com/vuejs/vue-next/commit/ad2a0bde988de743d4abc62b681b6a4888545a51))



# [3.0.0-alpha.0](https://github.com/vuejs/vue-next/compare/a8522cf48c09efbb2063f129cf1bea0dae09f10a...v3.0.0-alpha.0) (2019-12-20)

For changes between 2.x and 3.0 up to this release, please refer to merged RFCs [here](https://github.com/vuejs/rfcs/pulls?q=is%3Apr+is%3Amerged+label%3A3.x).
