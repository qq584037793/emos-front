<template>
	<div class="home">
		<el-row :gutter="70" type="flex" justify="center">
			<el-col :span="9" class="left">
				<h2>Emos Online Office System</h2>
				<div class="desc">
					<p>簡単な作業&nbsp;&nbsp;効率的な作業</p>
					<p>共に働く&nbsp;&nbsp;作業を簡単にします</p>
				</div>
				<div class="bottom">
					<div class="remark-container">
						<div class="ball blue">1</div>
						<div class="remark">先端技術</div>
					</div>
					<div class="remark-container">
						<div class="ball red">2</div>
						<div class="remark">強いチーム</div>
					</div>
					<div class="remark-container">
						<div class="ball green">3</div>
						<div class="remark">豊富な経験</div>
					</div>
				</div>
			</el-col>
			<el-col :span="11" class="right">
				<img src="../assets/home/banner.png" class="banner" /></el-col>
		</el-row>
	</div>
</template>

<script></script>

<style lang="less" scoped="scoped">
@import url('home.less');
</style>
