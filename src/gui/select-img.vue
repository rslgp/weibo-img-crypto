<template>
  <div>
	<meta name="viewport" content="width=device-width, initial-scale=0.86, maximum-scale=3.0">
   
	  <el-form>
		<el-form-item label="Current crypt key seed">
		  <el-input v-model="form.randomSeed"></el-input>
			<el-button type="primary" @click="onOk">Change Key</el-button>
		</el-form-item>
	  </el-form>	  

	<el-form>
      <el-form-item label="Encryption mode on:">
        <el-switch v-model="isEncryption" active-text="encrypt" inactive-text="decrypt"></el-switch>
      </el-form-item>
      <el-form-item label="Paste picture">
        <el-input @paste.native.prevent="onPaste" placeholder="You can also paste the image here"></el-input>
      </el-form-item>
      <el-form-item label="Select Image">
        <el-upload action="" drag multiple list-type="picture" :file-list="fileList" :before-upload="onUpload" :on-remove="onRemove" :on-preview="onPreview">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">Drag files here or <em>click to select</em></div>
        </el-upload>
      </el-form-item>
    </el-form>

    <el-dialog :title="largeImgTitle" :visible.sync="largeImgVisible" append-to-body>
      <a href="#" @click.prevent="onClickLargeImg">
        <img class="image" :src="largeImgUrl">
      </a>
    </el-dialog>
  </div>
</template>

<script>
import {encrypt, decrypt} from '../codec'
import {getConfig, setConfig} from '../config'

export default {
  data () {
    return {
      form: getConfig(),
      isEncryption: true,
      fileList: [],
      largeImgTitle: '',
      largeImgVisible: false,
      largeImgUrl: '',
      largeImgUrlShort: ''
    }
  },
  methods: {
    onPaste (event) {
      for (let item of event.clipboardData.items) {
        let file = item.getAsFile()
        if (file) {
          this.handleFile(file)
        }
      }
    },
    onOk () {
      setConfig(this.form)
    },
    onUpload (file) {
      this.handleFile(file)
      return false
    },
    handleFile (file) {
      if (!file.type.startsWith('image') || file.type === 'image/gif') { // 暂时不支持GIF
        return
      }
      let reader = new window.FileReader()
      reader.onload = () => {
        let img = new window.Image()
        img.onload = () => {
          if (this.isEncryption) {
            this.fileList.push({name: file.name, url: encrypt(img)})
          } else {
            decrypt(img).then(url => this.fileList.push({name: file.name, url: url}))
          }
        }
        img.src = reader.result
      }
      reader.readAsDataURL(file)
    },
    onRemove (file, fileList) {
      this.fileList = fileList
    },
    onPreview (file) {
      this.largeImgTitle = file.name
      this.largeImgUrl = file.url
      window.URL.revokeObjectURL(this.largeImgUrlShort)
      this.largeImgUrlShort = ''
      this.largeImgVisible = true
    },
    onClickLargeImg () {
      let url
      if (this.largeImgUrlShort) {
        url = this.largeImgUrlShort
      } else if (this.largeImgUrl.startsWith('data:')) {
        // Chrome和Edge无法打开data URL？
        let [memePart, base64Str] = this.largeImgUrl.split(',')
        let meme = /:(.*?);/.exec(memePart)[1]
        let dataStr = atob(base64Str)
        let data = new Uint8Array(dataStr.length)
        for (let i = 0; i < dataStr.length; i++) {
          data[i] = dataStr.charCodeAt(i)
        }
        url = this.largeImgUrlShort = window.URL.createObjectURL(new Blob([data], {type: meme}))
      } else {
        url = this.largeImgUrlShort = this.largeImgUrl
      }
      window.open(url) // Edge还是不允许打开blob URL，没办法了
    }
  }
}
</script>

<style scoped>
.mb {
  margin-bottom: 1em;
}

.image {
  width: 100%;
}
.el-input {
  width: 250px !important;
}
</style>
