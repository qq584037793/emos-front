<template>
	<el-dialog
		:title="!dataForm.id ? 'Add' : 'Update'"
		v-if="isAuth(['ROOT', 'DEPT:INSERT', 'DEPT:UPDATE'])"
		:close-on-click-modal="false"
		v-model="visible"
		width="420px"
	>
		<el-form :model="dataForm" ref="dataForm" :rules="dataRule" label-width="60px">
			<el-form-item label="部門" prop="deptName">
				<el-input v-model="dataForm.deptName" size="medium" style="width:100%" clearable />
			</el-form-item>
			<el-form-item label="TEL" prop="tel">
				<el-input v-model="dataForm.tel" size="medium" style="width:100%" clearable />
			</el-form-item>
			<el-form-item label="メール" prop="email">
				<el-input v-model="dataForm.email" size="medium" style="width:100%" clearable />
			</el-form-item>
			<el-form-item label="備考欄" prop="desc">
				<el-input v-model="dataForm.desc" style="width:100%" size="medium" maxlength="20" clearable />
			</el-form-item>
		</el-form>
		<template #footer>
			<span class="dialog-footer">
				<el-button size="medium" @click="visible = false">Cancel</el-button>
				<el-button type="primary" size="medium" @click="dataFormSubmit">Add</el-button>
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
				id: null,
				deptName: null,
				tel: null,
				email: null,
				desc: null
			},
			dataRule: {
				deptName: [
					{ required: true }
				],
				email: [
					{
						required: false,
						pattern: '^([a-zA-Z]|[0-9])(\\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$',
						message: 'メールフォーマットエラー'
					}
				]
			}
		};
	},

	methods: {
		init: function(id) {
			let that = this;
			that.dataForm.id = id || 0;
			that.visible = true;
			that.$nextTick(() => {
				that.$refs['dataForm'].resetFields();
				if (id) {
					that.$http('dept/searchById', 'POST', { id: id },true, function(resp) {
						that.dataForm.deptName = resp.deptName;
						that.dataForm.tel = resp.tel;
						that.dataForm.email = resp.email;
						that.dataForm.desc = resp.desc;
					});
				}
			});
		},
    dataFormSubmit:function (){
      let that=this;
      that.$refs['dataForm'].validate(valid=>{
        if(valid){
          that.$http(`dept/${!that.dataForm.id ? 'insert' : 'update'}`,'POST',that.dataForm,true,function (resp){
            if(resp.rows==1){
              that.$message({
                message:'success',
                type:'success',
                duration:1200
              });
              that.visible=false;
              that.$emit('refreshDataList');
            }else {
              that.$message({
                message:'failed',
                type:'error',
                duration:1200
              });
            }
          })
        }
      })
    }
	}
};
</script>

<style lang="less" scoped="scoped">
</style>
