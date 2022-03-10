<template>
	<el-dialog width="780px" :close-on-click-modal="false" v-model="visible" :show-close="false">
		<div id="pdfDom">
			<h2 class="title">従業員休暇单</h2>
			<table class="leave-table">
				<tr align="center">
					<td width="14%">名前</td>
					<td width="16%">{{ name }}</td>
					<td width="14%">性性別</td>
					<td width="16%">{{ sex }}</td>
					<td width="14%">部門</td>
					<td>{{ dept }}</td>
				</tr>
				<tr>
					<td align="center">休暇タイプ</td>
					<td colspan="5">{{ type }}</td>
				</tr>
				<tr>
					<td align="center">休暇時間</td>
					<td colspan="5">{{ start }}&nbsp;&nbsp;~&nbsp;&nbsp;{{ end }}</td>
				</tr>
				<tr>
					<td align="center">休暇理由</td>
					<td colspan="5">{{ reason }}</td>
				</tr>
				<tr>
					<td align="center">サイン</td>
					<td colspan="2"></td>
					<td align="center">人事サイン</td>
					<td colspan="3"></td>
				</tr>
			</table>

			<p class="desc">備考：休暇中、自由時間中のすべての責任を自分負います。休暇後、時間内に仕事に戻る必要があります。そうしないと、欠席として扱われます。</p>
		</div>
		<template #footer>
			<span class="dialog-footer">
				<el-button type="primary" @click="getPdf('#pdfDom')" size="medium">ダウンロード</el-button>
				<el-button size="medium" @click="cancel()">キャンセル</el-button>
				
			</span>
		</template>
	</el-dialog>
</template>

<script>
export default {
	data: function() {
		return {
			visible: false,
			htmlTitle: '従業員休暇单',
			name: null,
			sex: null,
			dept: null,
			reason: null,
			start: null,
			end: null,
			type: null
		};
	},
	methods: {
    init: function(id) {
      let that = this;
      that.visible = true;
      that.name = null;
      that.sex = null;
      that.dept = null;
      that.reason = null;
      that.start = null;
      that.end = null;
      that.type = null;
      that.$http('leave/searchLeaveById', 'POST', {id: id}, true, function(resp) {
        that.name = resp.name;
        that.sex = resp.sex;
        that.dept = resp.dept;
        that.reason = resp.reason;
        if (resp.type == 1) {
          that.type = '病気休暇';
        } else if (resp.type == 2) {
          that.type = '個人休暇';
        }
        that.start = resp.start;
        that.end = resp.end;
      });
    },
    cancel: function() {
      this.visible = false
    },

  }
};
</script>

<style lang="less" scoped="scoped">
@import url('leave_pdf.less');
</style>
