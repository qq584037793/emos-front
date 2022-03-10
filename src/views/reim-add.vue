<template>
  <el-dialog title="精算申請" :close-on-click-modal="false" v-model="visible" width="550px">
    <el-scrollbar height="470px">
      <el-form :model="dataForm" ref="dataForm" :rules="dataRule" label-width="100px">
        <el-form-item label="精算タイプ" prop="type">
          <el-radio-group v-model="dataForm.type" size="medium">
            <el-radio-button label="普通精算"></el-radio-button>
            <el-radio-button label="旅費精算"></el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="借金金額" prop="anleihen">
          <el-input
              v-model="dataForm.anleihen"
              placeholder="借金金額"
              size="medium"
              style="width:160px;"
              clearable="clearable"
              prop="anleihen"
          />
          <span class="note">借金金額を正直に記入してください</span>
        </el-form-item>
        <div v-for="(one, $index) in dataForm.project" class="project">
          <h3>【 精算項目 】</h3>
          <i class="el-icon-delete icon-delete" @click="deleteProjectHandle($index)"></i>
          <el-form-item
              label="項目名前"
              :prop="'project.' + $index + '.title'"
              :rules="{
                        required: true,
                    }"
          >
            <el-input v-model="one.title" size="medium" style="width:95%" maxlength="20" clearable />
          </el-form-item>
          <el-form-item
              label="項目タイプ"
              :prop="'project.' + $index + '.type'"
              :rules="{
                        required: true
                    }"
          >
            <el-select v-model="one.type" class="input" size="medium" clearable>
              <el-option label="事務用品" value="办公用品" />
              <el-option label="おもてなし費" value="招待费" />
              <el-option label="購入手数料" value="采购费" />
              <el-option label="人件費" value="劳务费" />
              <el-option label="トレーニング費" value="培训费" />
              <el-option label="メンテナンス費" value="维修费" />
              <el-option label="事務費" value="办公费" />
              <el-option label="その他" value="其他" />
            </el-select>
            <span class="note">精算項目を選択してください</span>
          </el-form-item>
          <el-form-item label="備考" prop="projectDesc">
            <el-input
                v-model="one.desc"
                type="textarea"
                size="medium"
                maxlength="50"
                style="width:95%"
                resize="none"
                show-word-limit
                clearable
            />
          </el-form-item>
          <el-form-item
              label="报销金额"
              :prop="'project.' + $index + '.money'"
              :rules="{
                        required: true,
                        pattern: '(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)'
                    }"
          >
            <el-input v-model="one.money" size="medium" style="width:160px;" clearable />
            <span class="note">返済額を注意深く確認してください</span>
          </el-form-item>
        </div>
      </el-form>
    </el-scrollbar>
    <template #footer>
        <span class="dialog-footer">
            <el-button type="danger" size="medium" @click="addHandle">項目追加</el-button>
            <el-button size="medium" @click="visible = false">キャンセル</el-button>
            <el-button type="primary" size="medium" @click="dataFormSubmit">確定</el-button>
        </span>
    </template>
  </el-dialog>
</template>

<script>
export default {
	data: function() {
		return {
			visible: false,
			dataForm: {
				type: '普通报销',
				anleihen: null,
				project: []
			},
			dataRule: {
				anleihen: [
					{
						required: true,
						pattern:
							'(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)', message: 'Amount formatted incorrectly'
					}
				]
			}
		};
	},
	methods: {
    init: function() {
      let that = this;
      that.visible = true;
      that.$nextTick(() => {
        that.$refs['dataForm'].resetFields();
        that.dataForm.type = '普通报销',
            that.dataForm.anleihen = null,
            that.dataForm.project = [{ title: null, type: null, desc: null, money: null }];
      });
    },
    addHandle: function() {
      let that = this;
      if (that.dataForm.project.length == 5) {
        that.$message({
          message: '5以下',
          type: 'warning',
          duration: 1200
        });
        return;
      }
      that.dataForm.project.push({ title: null, type: null, desc: null, money: null });
      that.$message({
        message: 'success',
        type: 'success',
        duration: 1200
      });
    },

    deleteProjectHandle: function(index) {
      let that = this;
      if (that.dataForm.project.length == 1) {
        that.$message({
          message: '残りの償還項目のみを削除することはできません',
          type: 'warning',
          duration: 1200
        });
      } else {
        that.dataForm.project.splice(index, 1);
        that.$message({
          message: 'success',
          type: 'success',
          duration: 1200
        });
      }
    },

    dataFormSubmit: function() {
      let that = this;
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          let amount = 0;
          for (let one of that.dataForm.project) {
            amount += Number(one.money);
          }
          let data = {
            typeId: that.dataForm.type == '普通报销' ? 1 : 2,
            amount: amount,
            anleihen: that.dataForm.anleihen,
            balance: amount - Number(that.dataForm.anleihen),
            content: JSON.stringify(that.dataForm.project)
          };
          that.$http(`reim/insert`, 'POST', data, true, function(resp) {
            if (resp.rows == 1) {
              that.$message({
                message: 'success',
                type: 'success',
                duration: 1200
              });
              that.visible = false;
              that.$emit('refreshDataList');
            } else {
              that.$message({
                message: 'failed',
                type: 'error',
                duration: 1200
              });
            }
          });
        }
      });
    }




  }
};
</script>

<style lang="less" scoped="scoped">
.note {
	color: #999;
	margin-left: 15px;
}
.project {
	border-top: dashed 1px #e0e0e0;
	position: relative;
}
h3 {
	text-align: center;
	margin: 20px 0;
}
.icon-delete {
	position: absolute;
	right: 20px;
	top: 20px;
	height: 24px;
	width: 24px;
	cursor: pointer;
}
</style>
