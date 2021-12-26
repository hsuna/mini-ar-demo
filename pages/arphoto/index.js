
/**
 * author: Zmikoo
 * blob: https://blog.csdn.net/qq_34568700/article/details/117232302
 */
import * as modelBusiness from "./threeBusiness.js";

let THREE, gltfLoader;
Page({
    /**
     * 页面的初始数据
     */
    data: {
        containerType: "camera", // 可能值：camera拍照页，photo照片页
        photoCtx: null,
        photoUrl: '',
        photoSize: { width: 300, height: 500 },
        sysInfo: {
            width: 0,
            height: 0,
            platform: "",
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.getSysInfo();
        this.initThree();
    },
    onUnload() {
        wx.stopGyroscope({
          success: (res) => {},
        })
    },
    // 3D相关
    initThree() {
        var self = this;
        modelBusiness.initThree("webgl", function (three, loader) {
            THREE = three;
            gltfLoader = loader;
            self.loadModel();

            const pos = { x: 0, y: 0, z: 0 };
            const camera = modelBusiness.getCamera();
            wx.startGyroscope({
                interval: 'ui',
                success: () => {
                    wx.onGyroscopeChange((res) => {
                        pos.x = pos.x + res.y * 0.1;
                        pos.y = pos.y + res.x * 0.1;
                        pos.z = pos.z + res.z * 0.1;
                        camera.lookAt(pos.x, pos.y, pos.z);
                    })
                }
            });
        });
    },
    loadModel() {
        wx.showLoading({
            title: '模型正在准备中...',
        });
        let modelUrl = 'https://radar-static.amwaynet.com.cn/apps/super-radar/admin/v1/image/02104771404616700426526542596.glb'
        // `https://radar-static.amwaynet.com.cn/apps/super-radar/admin/v1/image/107373424046134096636793131574.gltf`;
        gltfLoader.load(modelUrl, (obj) => {
            let scene = obj.scene;
            scene.scale.set(0.02,0.02,0.02);
            scene.rotation.set(0.1, 1.57, 0);
            modelBusiness.addToScene(scene);

            let clock = new THREE.Clock();
            let mixer = new THREE.AnimationMixer(scene); // 创建混合器
            let AnimationAction = mixer.clipAction(obj.animations[0]); // 返回动画操作对象

            AnimationAction.play();
            setInterval(() => {
                mixer.update(clock.getDelta());
            }, 10);
            wx.hideLoading();
        });
    },
    // 拍照相关
    takePhoto() {
        let self = this;
        wx.showLoading({
            title: "图片处理中...",
        });
        this.setData({
            photoUrl: "", // 为保证重复拍照时，底部分享和照片同时出现
        });
        wx.createCameraContext().takePhoto({
            quality: "low",
            success: (res) => {
                self.webglToPhoto(res.tempImagePath);
            },
        });
    },
    webglToPhoto(photo) {
        let self = this;
        const query = wx.createSelectorQuery();
        query
            .select("#canvas")
            .fields({ node: true, size: true })
            .exec((res) => {
                modelBusiness.clipWebgl(res[0].node, photo).then((webglImg) => {
                    const ctx = wx.createCanvasContext("photo");
                    const { width, height } = self.data.sysInfo;
                    ctx.drawImage(photo, 0, 0, width, height);
                    ctx.drawImage(webglImg.path, 0, 0, width, height);
                    ctx.draw(true);

                    wx.getImageInfo({ 
                        src: 'https://radar-static.amwaynet.com.cn/apps/super-radar/admin/v1/image/90613752304616814434966952012.png', 
                        success: (res) => {
                            ctx.drawImage(res.path, 0, 0, width, height);
                            ctx.draw(true);
                            self.canvasToImg(ctx, width, height);
                        }
                    })
                });
            });
        return;
    },
    canvasToImg(ctx, width, height) {
        let self = this;
        self.setData({
            containerType: "photo",
        });
        ctx.draw(
            true,
            setTimeout(() => {
                wx.canvasToTempFilePath({
                    quality: 0.5,
                    x: 0,
                    y: 0,
                    width: width,
                    height: height,
                    destWidth: width * wx.getSystemInfoSync().pixelRatio,
                    destHeight: height * wx.getSystemInfoSync().pixelRatio,
                    canvasId: "photo",
                    fileType: "jpg",
                    success(res) {
                        wx.hideLoading();
                        self.setData({
                            photoUrl: res.tempFilePath
                        });
                    },
                    fail(err) {
                        wx.hideLoading({
                            success: (res) => { },
                        });
                    },
                    complete() {
                        wx.hideLoading({
                            success: (res) => { },
                        });
                    }, // end complete
                });
            }, 1000)
        );
    },
    savePhoto() {
        let self = this;
        wx.saveImageToPhotosAlbum({
            filePath: this.data.photoUrl,
            success() {
                wx.showToast({
                    title: "图片已为您保存到本地",
                    icon: "none",
                    success() {
                    },
                });
            },
        });
    },
    back() {
        this.setData({
            containerType: "camera",
            photoUrl: ""
        });
    },

    onTX(e) {
        // modelBusiness.onTX(e)
    },
    getSysInfo() {
        wx.getSystemInfo({
            success: result => {
                this.setData({
                    sysInfo: {
                        width: result.windowWidth,
                        height: result.windowHeight,
                        platform: result.platform,
                    },
                    "photoSize.width": result.windowWidth * result.pixelRatio,
                    "photoSize.height": result.windowHeight * result.pixelRatio,
                });
            },
        });
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        modelBusiness.disposeAll();
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        modelBusiness.disposeAll();
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})