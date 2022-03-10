<template>
	<el-dialog
		:title="!dataForm.id ? 'Add' : 'Update'"
		v-if="isAuth(['ROOT', 'ROLE:INSERT', 'ROLE:UPDATE'])"
		:close-on-click-modal="false"
		v-model="visible"
		custom-class="dialog"
		width="692px"
	>
		<el-form :model="dataForm" ref="dataForm" :rules="dataRule" label-width="60px">
			<el-form-item label="役割" prop="roleName">
				<el-input v-model="dataForm.roleName" size="medium" style="width:50%" :readonly="systemic" clearable />
				<span class="note">（文字名は2〜10文字）</span>
			</el-form-item>
			<el-form-item label="備考欄" prop="desc">
				<el-input v-model="dataForm.desc" style="width:50%" size="medium" maxlength="20" clearable />
				<span class="note">（備考は20文字以内）</span>
			</el-form-item>
			<el-form-item label="権限" prop="permissions">
				<el-transfer
					v-model="dataForm.permissions"
					:data="permisionList"
					size="medium"
					:titles="['権限リスト', '権限']"
					filterable
					filter-placeholder="権限を選択"
				/>
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
      //标记角色是否为系统内置,弹窗是否会用到
			systemic: true,
			dataForm: {
				id: null,
				roleName: null,
        //用户选中的权限
				permissions: [],
				desc: null,
				changed: false
			},
      //所有权限
			permisionList: [],
      //角色拥有的权限
			oldPermissions: [],
			dataRule: {
				roleName: [
					{ required: true }
				],
				permissions: [
					{ required: true, trigger: 'blur', message: 'ロールに関連付けられた権限はありません' },
					{ required: false, trigger: 'change', message: 'ロールに関連付けられた権限はありません' }
				]
			}
		};
	},

	methods: {
		init: function(id, systemic) {
			let that = this;
			that.dataForm.id = id || 0;
			that.systemic = systemic;
			that.visible = true;
			that.$nextTick(() => {
				that.$refs['dataForm'].resetFields();
				let defaultPermissions = [];
				if (id) {
					that.$http('role/searchById', 'POST', { id: id }, false, function(resp) {
						that.dataForm.roleName = resp.roleName;
						that.dataForm.desc = resp.desc;
						that.dataForm.permissions = JSON.parse(resp.permissions);
						//保存原始权限数据
						that.oldPermissions = JSON.parse(resp.permissions);
						defaultPermissions = resp.defaultPermissions;
					});
				}
				that.$http('permission/searchAllPermission', 'GET', null, true, function(resp) {
					let temp = [];
          //遍历所有系统权限
					for (let one of resp.list) {
						let disabled = false;
            //判断是否为内置角色
						if (that.systemic) {
              //如果默认权限含义某个权限,将disable设置为true,禁止选中
							disabled = defaultPermissions.includes(one.id);
						}
            //生成临时的permission
						temp.push({ key: one.id, label: `${one.moduleName}（${one.actionName}）`, disabled: disabled });
					}
          //更新permission
					that.permisionList = temp;
				});
			});
		},
    dataFormSubmit: function() {
      let that = this;
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          //因为用户是随机选择权限，所以对选中的权限排序
          that.dataForm.permissions.sort(function(a, b) {
            return a - b;
          });
          //判断用户选择的权限和原来的权限是否一致？把数组转换成字符串，简化比较两个数组是否一致
          if (that.dataForm.permissions.join() != that.oldPermissions.join()) {
            that.dataForm.changed = true;
          } else {
            that.dataForm.changed = false;
          }
          that.$http(`role/${!that.dataForm.id ? 'insert' : 'update'}`, 'POST', that.dataForm, true, function(
              resp
          ) {
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
	margin-left: 20px;
	color: #999;
}
</style>
