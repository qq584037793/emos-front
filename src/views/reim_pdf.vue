<template>
	<el-dialog width="800px" :close-on-click-modal="false" v-model="visible" :show-close="false" center>
		<div id="pdfDom">
			<img :src="qrCodeBase64" class="qrCode">
			<h2 class="title">費&nbsp;&nbsp;&nbsp;用&nbsp;&nbsp;&nbsp;精&nbsp;&nbsp;&nbsp;算&nbsp;&nbsp;&nbsp;表</h2>
			<div class="top-info-container">
				<span class="info">精算部門：{{ dept }}</span>
				<span class="info">精算人：{{ name }}</span>
				<span class="info">精算日付：{{ date }}</span>
			</div>
			<div class="reim-table-container">
				<table class="reim-table">
					<tr align="center">
						<th width="30%">精算項目</th>
						<th width="34%">備考欄</th>
						<th width="20%">カテゴリー</th>
						<th width="16%">金額</th>
					</tr>
					<tr align="center" v-for="one in content">
						<td align="left">{{one.title}}</td>
						<td align="left">{{one.desc}}</td>
						<td>{{one.type}}</td>
						<td align="left">{{one.money!=""?one.money+"円":""}}</td>
					</tr>
					<tr>
						<th align="center">精算合計</th>
						<td colspan="3">{{ amount }}円</td>
					</tr>
					<tr>
						<td colspan="5">
							<div class="info-container">
								<span class="info">借金金額：{{ anleihen }}円</span>
								<span class="info">返済金額：{{ money_1 }}円</span>
								<span class="info">精算金額：{{ money_2 }}円</span>
							</div>
						</td>
					</tr>
				</table>
			</div>
			<div class="bottom-info-container"></div>
			<div class="bottom-info-container">
				<span class="sig">経理主任：</span>
				<span class="sig">レビュー：</span>
				<span class="sig">出纳：</span>
				<span class="sig">精算人：</span>
			</div>
		</div>
		<template #footer>
			<span class="dialog-footer">
				<el-button type="primary" @click="getPdf('#pdfDom')" size="medium">Download</el-button>
				<el-button size="medium" @click="cancel()">Close</el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script>
export default {
	data: function() {
		return {
			visible: false,
			htmlTitle: '费用精算表',
			dept: null,
			name: null,
			date: null,
			amount: null,
			balance: null,
			anleihen: null,
			money_1: 0,
			money_2: 0,
			content:[],
			qrCodeBase64:null
		};
	},
	methods: {
    init: function(id) {
      let that = this;
      that.visible = true;
      that.dept = null;
      that.name = null;
      that.date = null;
      that.amount = null;
      that.balance = null;
      that.anleihen = null;
      that.money_1 = 0;
      that.money_2 = 0;
      that.content = [];
      that.$http('reim/searchReimById', 'POST', { id: id }, true, function(resp) {
        that.dept = resp.dept;
        that.name = resp.name;
        that.date = resp.date;
        that.amount = resp.amount;
        that.balance = resp.balance;
        that.anleihen = resp.anleihen;
        if (that.anleihen > that.amount) {
          that.money_1 = that.anleihen - that.amount;
        } else if (that.anleihen < that.amount) {
          that.money_2 = that.amount - that.anleihen;
        }
        let content = JSON.parse(resp.content);
        let temp = 5 - content.length;
        for (let i = 0; i < temp; i++) {
          content.push({ title: '', desc: '', type: '', money: '' });
        }
        that.content = content;
        that.qrCodeBase64 = resp.qrCodeBase64;
      });
    },
    cancel: function() {
      this.visible = false;
    }
	}
};
</script>

<style lang="less" scoped="scoped">
@import url('reim_pdf.less');
</style>
