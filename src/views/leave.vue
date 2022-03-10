<template>
  <div>
    <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="dataForm">
      <el-form-item prop="name">
        <el-input
            v-model="dataForm.name"
            class="input"
            placeholder="名前"
            size="medium"
            :disabled="!isAuth(['ROOT', 'LEAVE:SELECT'])"
            clearable="clearable"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-select
            v-model="dataForm.deptId"
            class="input"
            placeholder="部門"
            size="medium"
            :disabled="!isAuth(['ROOT', 'LEAVE:SELECT'])"
            clearable="clearable"
        >
          <el-option v-for="one in deptList" :key="one.id" :label="one.deptName" :value="one.id"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-date-picker
            v-model="dataForm.date"
            style="width: 160px;"
            type="date"
            size="medium"
            placeholder="休暇日付"
            clearable="clearable"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-select v-model="dataForm.type" class="input" placeholder="タイプ" size="medium" clearable="clearable">
          <el-option label="病気休暇" value="1"></el-option>
          <el-option label="個人休暇" value="2"></el-option>
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
          <el-option label="申請中" value="1"></el-option>
          <el-option label="却下" value="2"></el-option>
          <el-option label="承認済み" value="3"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="searchHandle()" type="primary" size="medium">Search</el-button>
        <el-button type="danger" size="medium" @click="addHandle()">Add</el-button>
      </el-form-item>
    </el-form>
    <el-table
        :data="dataList"
        border="border"
        v-loading="dataListLoading"
        cell-style="padding: 4px 0"
        style="width: 100%;"
        size="medium"
    >
      <el-table-column width="40px" prop="reason" header-align="center" align="center" type="expand">
        <template #default="scope">
          休暇理由：{{ scope.row.reason }}
        </template>
      </el-table-column>
      <el-table-column type="index" header-align="center" align="center" width="100" label="ナンバー">
        <template #default="scope">
          <span>{{ (pageIndex - 1) * pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" header-align="center" align="center" label="名前" min-width="150"></el-table-column>
      <el-table-column prop="deptName" header-align="center" align="center" label="部門"
                       min-width="150"></el-table-column>
      <el-table-column prop="start" header-align="center" align="center" label="始める" min-width="180"></el-table-column>
      <el-table-column prop="end" header-align="center" align="center" label="終わる" min-width="180"></el-table-column>
      <el-table-column prop="type" header-align="center" align="center" label="休暇タイプ" min-width="150"></el-table-column>

      <el-table-column prop="status" header-align="center" align="center" label="休暇状態" min-width="120">
        <template #default="scope">
          <span v-if="scope.row.status == '请假中'" style="color: orange;">申請中</span>
          <span v-if="scope.row.status == '已同意'" style="color: #17B3A3;">承認</span>
          <span v-if="scope.row.status == '不同意'" style="color: #f56c6c;">却下</span>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" width="120" label="休暇表" min-width="120">
        <template #default="scope">
          <el-button
              type="text"
              size="medium"
              v-if="scope.row.status == '已同意'"
              @click="pdfHandle(scope.row.id)"
          >
            休暇表
          </el-button>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" width="150" label="操作" min-width="120">
        <template #default="scope">
          <el-button
              type="text"
              size="medium"
              :disabled="scope.row.status == '已同意' || scope.row.mine != true"
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
    <leave-add v-if="addVisible" ref="add" @refreshDataList="loadDataList"></leave-add>
    <leave-pdf v-if="pdfVisible" ref="pdf" @refreshDataList="loadDataList"></leave-pdf>
  </div>
</template>

<script>
import dayjs from 'dayjs';
import LeaveAdd from './leave-add.vue';
import LeavePdf from './leave_pdf.vue';

export default {
  components: {LeaveAdd, LeavePdf},
  data: function () {
    return {
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      dataForm: {
        name: null,
        deptId: null,
        date: null,
        type: null,
        status: null
      },
      dataList: [],
      deptList: [],
      addVisible: false,
      pdfVisible: false,
      dataRule: {
        name: [{required: false }]
      }
    };
  },
  methods: {
    loadDeptList: function () {
      let that = this;
      that.$http('dept/searchAllDept', 'GET', null, true, function (resp) {
        that.deptList = resp.list;
      });
    },
    loadDataList: function () {
      let that = this;
      that.dataListLoading = true;
      let data = {
        name: that.dataForm.name,
        deptId: that.dataForm.deptId,
        date: that.dataForm.date,
        type: that.dataForm.type,
        status: that.dataForm.status,
        page: that.pageIndex,
        length: that.pageSize
      };
      if (that.dataForm.date != null && that.dataForm.date != '') {
        data.date = dayjs(that.dataForm.date).format('YYYY-MM-DD');
      }
      that.$http('leave/searchLeaveByPage', 'POST', data, true, function (resp) {
        let page = resp.page;
        for (let one of page.list) {
          if (one.type == 1) {
            one.type = '病気休暇';
          } else if (one.type == 2) {
            one.type = '個人休暇';
          }
          if (one.status == 1) {
            one.status = '请假中';
          } else if (one.status == 2) {
            one.status = '不同意';
          } else if (one.status == 3) {
            one.status = '已同意';
          }
        }
        that.dataList = page.list;
        that.totalCount = page.totalCount;
        that.dataListLoading = false;
      });
    },
    searchHandle: function () {
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
    addHandle: function () {
      this.addVisible = true;
      this.$nextTick(() => {
        this.$refs.add.init();
      });
    },
    deleteHandle: function (id) {
      let that = this;
      that.$confirm(`選択したレコードを削除してもよろしいですか？`, {
        confirmButtonText: 'YES',
        cancelButtonText: 'NO',
        type: 'warning'
      }).then(() => {
        let data = {
          id: id
        };
        that.$http('leave/deleteLeaveById', 'POST', data, true, function (resp) {
          if (resp.rows > 0) {
            that.$message({
              message: 'success',
              type: 'success',
              duration: 1200
            });
            that.loadDataList();
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
    pdfHandle: function(id) {
      this.pdfVisible = true;
      this.$nextTick(() => {
        this.$refs.pdf.init(id);
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
    }

  },
  created: function () {
    this.loadDeptList();
    this.loadDataList();
  }
};
</script>

<style lang="less" scoped=""></style>
