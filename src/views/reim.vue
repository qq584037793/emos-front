<template>
	<div>
		<el-form :inline="true" :model="dataForm" :rules="dataRule" ref="dataForm">
			<el-form-item prop="name">
				<el-input
					v-model="dataForm.name"
					placeholder="名前"
					size="medium"
					class="input"
					clearable="clearable"
				/>
			</el-form-item>
			<el-form-item>
				<el-select
					v-model="dataForm.deptId"
					class="input"
					placeholder="部門"
					size="medium"
					clearable="clearable"
				>
					<el-option v-for="one in deptList" :label="one.deptName" :value="one.id" />
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-select
					v-model="dataForm.typeId"
					class="input"
					placeholder="タイプ"
					size="medium"
					clearable="clearable"
				>
					<el-option label="普通精算" value="1" />
					<el-option label="旅費精算" value="2" />
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-select
					v-model="dataForm.status"
					class="input"
					placeholder="状態"
					size="medium"
					clearable="clearable"
				>
					<el-option label="申請待ち" value="1" />
					<el-option label="却下" value="2" />
					<el-option label="承認済み" value="3" />
					<el-option label="アーカイブ済み" value="4" />
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-date-picker
					v-model="dataForm.date"
					type="daterange"
					range-separator="~"
					start-placeholder="開始日付"
					end-placeholder="結束日付"
					size="medium"
				></el-date-picker>
			</el-form-item>
			<el-form-item>
				<el-button size="medium" type="primary" @click="searchHandle()">Search</el-button>
				<el-button size="medium" type="primary" @click="addHandle()">Add</el-button>
			</el-form-item>
		</el-form>
		<el-table
			:data="dataList"
			border
			v-loading="dataListLoading"
			cell-style="padding: 4px 0"
			style="width: 100%;"
			size="medium"
		>
			<el-table-column
				width="40px"
				prop="content"
				header-align="center"
				align="center"
				type="expand"
			>
				<template #default="scope">
					<div class="reim-table">
						<div class="row">
							<div class="title">ナンバー</div>
							<div class="title">カテゴリー</div>
							<div class="title">精算项目</div>
							<div class="title">备注信息</div>
							<div class="title">金额</div>
						</div>
						<div class="row" v-for="(one, $index) in scope.row.content">
							<div class="col">{{ $index + 1 }}</div>
							<div class="col">{{ one.type }}</div>
							<div class="col">{{ one.title }}</div>
							<div class="col">{{ one.desc }}</div>
							<div class="col">￥{{ one.money }}</div>
						</div>
					</div>
				</template>
			</el-table-column>
			<el-table-column
				type="index"
				header-align="center"
				align="center"
				width="100"
				label="ナンバー"
			>
				<template #default="scope">
					<span>{{ (pageIndex - 1) * pageSize + scope.$index + 1 }}</span>
				</template>
			</el-table-column>
			<el-table-column
				prop="type"
				header-align="center"
				align="center"
				label="精算タイプ"
				min-width="150"
			/>
			<el-table-column
				prop="name"
				header-align="center"
				align="center"
				label="申請人"
				min-width="150"
			/>
			<el-table-column
				prop="deptName"
				header-align="center"
				align="center"
				label="所属部门"
				width="150"
			/>
			<el-table-column header-align="center" align="center" label="精算金額" min-width="120">
				<template #default="scope">
					<span>{{ scope.row.amount }}円</span>
				</template>
			</el-table-column>
			<el-table-column header-align="center" align="center" label="借金金額" min-width="120">
				<template #default="scope">
					<span>{{ scope.row.anleihen }}円</span>
				</template>
			</el-table-column>
			<el-table-column header-align="center" align="center" label="実際精算" min-width="120">
				<template #default="scope">
					<span>{{ scope.row.balance }}円</span>
				</template>
			</el-table-column>
      <el-table-column
          prop="status"
          header-align="center"
          align="center"
          label="状態"
          min-width="100"
      />
			<el-table-column
				prop="createTime"
				header-align="center"
				align="center"
				label="申请日付"
				width="150"
			/>
			<el-table-column header-align="center" align="center" min-width="150" label="操作">
				<template #default="scope">
					<el-button 
						type="text" 
						size="medium"
						@click="pdfHandle(scope.row.id)">
						精算表
					</el-button>
					<el-button
						type="text"
						size="medium"
						:disabled="!(['待审批', '已否决'].includes(scope.row.status) && scope.row.mine == 'true')"
						@click="deleteHandle(scope.row.id)"
					>
						削除
					</el-button>
				</template>
			</el-table-column>
		</el-table>
		<el-pagination
			@size-change="sizeChangeHandle"
			@current-change="currentChangeHandle"
			:current-page="pageIndex"
			:page-sizes="[10, 20, 50]"
			:page-size="pageSize"
			:total="totalCount"
			layout="total, sizes, prev, pager, next, jumper"
		></el-pagination>
	</div>
	<add v-if="addVisible" ref="add" @refreshDataList="loadDataList"></add>
	<reim-pdf v-if="pdfVisible" ref="pdf" @refreshDataList="loadDataList"></reim-pdf>
</template>

<script>
import Add from './reim-add.vue';
import dayjs from 'dayjs';
import ReimPdf from './reim_pdf.vue';
export default {
	components: { Add, ReimPdf },
	data: function() {
		return {
			dataForm: {
				name: null,
				deptId: null,
				status: null,
				typeId: null,
				date: null
			},
			deptList: [],
			dataList: [],
			pageIndex: 1,
			pageSize: 10,
			totalCount: 0,
			dataListLoading: false,
			dataRule: {
				name: [
					{ required: false }
				]
			},
			addVisible: false,
			pdfVisible: false
		};
	},
	methods: {
		loadDeptList: function() {
			let that = this;
			that.$http('dept/searchAllDept', 'GET', null, true, function(resp) {
				that.deptList = resp.list;
			});
		},
    loadDataList: function() {
      let that = this;
      that.dataListLoading = true;

      let data = {
        name: that.dataForm.name,
        deptId: that.dataForm.deptId,
        typeId: that.dataForm.typeId,
        status: that.dataForm.status,
        page: that.pageIndex,
        length: that.pageSize
      };
      if (that.dataForm.date != null && that.dataForm.date.length == 2) {
        let startDate = that.dataForm.date[0];
        let endDate = that.dataForm.date[1];
        data.startDate = dayjs(startDate).format('YYYY-MM-DD');
        data.endDate = dayjs(endDate).format('YYYY-MM-DD');
      }

      that.$http('reim/searchReimByPage', 'POST', data, true, function(resp) {
        let page = resp.page;
        let status = {
          1: '待审批',
          2: '已否决',
          3: '已通过',
          4: '已归档'
        };
        let type = { 1: '普通报销', 2: '差旅报销' };
        for (let one of page.list) {
          one.status = status[one.status];
          one.type = type[one.typeId];
          one.content = JSON.parse(one.content);
        }

        that.dataList = page.list;
        that.totalCount = page.totalCount;
        that.dataListLoading = false;
      });
    },
    sizeChangeHandle: function(val) {
      this.pageSize = val;
      this.pageIndex = 1;
      this.loadDataList();
    },
    currentChangeHandle: function(val) {
      this.pageIndex = val;
      this.loadDataList();
    },
    searchHandle: function() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.$refs['dataForm'].clearValidate();
          if (this.dataForm.name == '') {
            this.dataForm.name = null;
          }
          if (this.pageIndex != 1) {
            this.pageIndex = 1;
          }
          this.loadDataList();
        } else {
          return false;
        }
      });
    },
    addHandle: function() {
      this.addVisible = true;
      this.$nextTick(() => {
        this.$refs.add.init();
      });
    },
    pdfHandle: function(id) {
      this.pdfVisible = true;
      this.$nextTick(() => {
        this.$refs.pdf.init(id);
      });
    },
    deleteHandle: function(id) {
      let that = this;
      that.$confirm(`選択したレコードを削除してもよろしいですか？`,  {
        confirmButtonText: 'YES',
        cancelButtonText: 'NO',
        type: 'warning'
      }).then(() => {
        that.$http('reim/deleteReimById', 'POST', { id: id }, true, function(resp) {
          if (resp.rows > 0) {
            that.$message({
              message: 'success',
              type: 'success',
              duration: 1200,
              onClose: () => {
                that.loadDataList();
              }
            });
          } else {
            that.$message({
              message: 'failed',
              type: 'warning',
              duration: 1200
            });
          }
        });
      });
    },



  },
	created: function() {
		this.loadDeptList();
    this.loadDataList();
	}
};
</script>

<style lang="less" scoped="scoped">
@import url('reim.less');
</style>
