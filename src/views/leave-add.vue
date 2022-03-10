<template>
	<el-dialog title="休暇申請" :close-on-click-modal="false" v-model="visible" width="450px">
		<el-form :model="dataForm" ref="dataForm" :rules="dataRule" label-width="80px">
			<el-form-item label="休暇理由" prop="reason">
				<el-input
					type="textarea"
					v-model="dataForm.reason"
					placeholder="休暇理由"
					:autosize="{ minRows: 4, maxRows: 6 }"
					clearable="clearable"
				/>
			</el-form-item>
			<el-form-item label="開始日">
				<el-row type="flex" justify="space-between">
					<el-col :span="12">
						<el-form-item prop="startDate" class="form-item">
							<el-date-picker
								v-model="dataForm.startDate"
								value-format="yyyy-MM-dd"
								type="date"
								placeholder="開始日"
								style="width: 100%;"
								:disabledDate="disabledDate"
								clearable="clearable"
							></el-date-picker>
						</el-form-item>
					</el-col>
					<el-col :span="11">
						<el-form-item prop="startTime" class="form-item">
							<el-time-select
								v-model="dataForm.startTime"
								start='08:30'
								step='00:30'
								end='20:30'
								value-format="HH:mm"
								placeholder="時間選択"
								style="width: 100%;"
							></el-time-select>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form-item>
			<el-form-item label="終了日">
				<el-row type="flex" justify="space-between">
					<el-col :span="12">
						<el-form-item prop="endDate" class="form-item">
							<el-date-picker
								v-model="dataForm.endDate"
								value-format="yyyy-MM-dd"
								type="date"
								placeholder="終了日"
								style="width: 100%;"
								:disabledDate="disabledDate"
								clearable="clearable"
							></el-date-picker>
						</el-form-item>
					</el-col>
					<el-col :span="11">
						<el-form-item prop="endTime" class="form-item">
							<el-time-select
								v-model="dataForm.endTime"
								value-format="HH:mm"
								start='08:30'
								step='00:30'
								end='20:30'
								placeholder="時間選択"
								style="width: 100%;"
							></el-time-select>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form-item>
			<el-form-item label="休暇タイプ" prop="type">
				<el-radio-group v-model="dataForm.type">
					<el-radio :label="1">病気休暇</el-radio>
					<el-radio :label="2">個人休暇</el-radio>
				</el-radio-group>
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
import dayjs from 'dayjs';
export default {
	data: function() {
		return {
			visible: false,
			dataForm: {
				reason: null,
				startDate: null,
				startTime: null,
				endDate: null,
				endTime: null,
				type: null
			},
			disabledDate(date) {
				return dayjs(date.toLocaleDateString()).isBefore(new Date().toLocaleDateString());
			},
			dataRule: {
				reason: [{ required: true }],
				startDate: [{ required: true }],
				startTime: [{ required: true }],
				endDate: [{ required: true }],
				endTime: [{ required: true}],
				type: [{ required: true }]
			}
		};
	},
	methods: {
		init: function(id) {
			let that = this;
			that.visible = true;
			that.$nextTick(() => {
				that.$refs['dataForm'].resetFields();
			});
		},
    dataFormSubmit: function() {
      let that = this;
      let data = {
        reason: that.dataForm.reason,
        start: dayjs(that.dataForm.startDate).format('YYYY-MM-DD') + ' ' + that.dataForm.startTime + ':00',
        end: dayjs(that.dataForm.endDate).format('YYYY-MM-DD') + ' ' + that.dataForm.endTime + ':00',
        type: that.dataForm.type
      };
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          that.$http('leave/insert', 'POST', data, true, function(resp) {
            if (resp.rows == 1) {
              that.visible = false;
              that.$message({
                message: 'success',
                type: 'success',
                duration: 1200
              });
              setTimeout(function() {
                that.$emit('refreshDataList');
              }, 1200);
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
.form-item{
	margin-bottom: 0 !important;
}
</style>
