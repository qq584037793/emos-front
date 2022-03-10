<template>
  <div v-if="isAuth(['ROOT', 'ROLE:SELECT'])">
    <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="dataForm">
      <el-form-item prop="roleName">
        <el-input
            v-model="dataForm.roleName"
            placeholder="役割名"
            size="medium"
            class="input"
            clearable="clearable"
        />
      </el-form-item>
      <el-form-item>
        <el-button size="medium" type="primary" @click="searchHandle()">Search</el-button>
        <el-button
            size="medium"
            type="primary"
            :disabled="!isAuth(['ROOT', 'ROLE:INSERT'])"
            @click="addHandle()"
        >
          Add
        </el-button>
        <el-button
            size="medium"
            type="danger"
            :disabled="!isAuth(['ROOT', 'ROLE:DELETE'])"
            @click="deleteHandle()"
        >
          Delete All
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
        :data="dataList"
        border
        v-loading="dataListLoading"
        @selection-change="selectionChangeHandle"
        cell-style="padding: 4px 0"
        style="width: 100%;"
        size="medium"
    >
      <el-table-column
          type="selection"
          :selectable="selectable"
          header-align="center"
          align="center"
          width="50"
      />
      <el-table-column type="index" header-align="center" align="center" width="100" label="ナンバー">
        <template #default="scope">
          <span>{{ (pageIndex - 1) * pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="roleName" header-align="center" align="center" label="役割名" min-width="180"/>
      <el-table-column header-align="center" align="center" label="権限数" min-width="140">
        <template #default="scope">
          <span>{{ scope.row.permissions }}个</span>
        </template>
      </el-table-column>
      <el-table-column prop="users" header-align="center" align="center" label="関連ユーザー" min-width="140">
        <template #default="scope">
          <span>{{ scope.row.users }}人</span>
        </template>
      </el-table-column>
      <el-table-column prop="desc" header-align="center" align="center" label="備考欄" min-width="450"/>
      <el-table-column prop="systemic" header-align="center" align="center" label="組み込み役割" min-width="100">
        <template #default="scope">
          <span>{{ scope.row.systemic ? 'YES' : 'NO' }}</span>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" width="150" label="操作">
        <template #default="scope">
          <el-button
              type="text"
              size="medium"
              :disabled="!isAuth(['ROOT', 'ROLE:UPDATE']) || scope.row.id == 0"
              @click="updateHandle(scope.row.id, scope.row.systemic)"
          >
            更新
          </el-button>
          <el-button
              type="text"
              size="medium"
              :disabled="!isAuth(['ROOT', 'ROLE:DELETE']) || scope.row.systemic || scope.row.users > 0"
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
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="loadDataList"></add-or-update>
  </div>
</template>

<script>
import AddOrUpdate from './role-add-or-update.vue';

export default {
  components: {
    AddOrUpdate
  },
  data: function () {
    return {
      dataForm: {
        roleName: null
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalCount: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      dataRule: {
        roleName: [{required: false, pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,10}$', message: '角色格式错误'}]
      }
    };
  },
  methods: {
    loadDataList: function() {
      let that = this;
      that.dataListLoading = true;
      let data = {
        roleName: that.dataForm.roleName,
        page: that.pageIndex,
        length: that.pageSize
      };
      that.$http('role/searchRoleByPage', 'POST', data, true, function(resp) {
        let page = resp.page;
        that.dataList = page.list;
        that.totalCount = page.totalCount;
        that.dataListLoading = false;
      });
    },
    searchHandle: function() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.$refs['dataForm'].clearValidate();
          if (this.dataForm.roleName == '') {
            this.dataForm.roleName = null;
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
    selectionChangeHandle: function (val) {
      this.dataListSelections = val;
    },
    selectable: function (row, index) {
      //如果是关联或者内置角色,禁止删除选中
      if (row.systemic || row.users > 0) {
        return false;
      }
      return true;
    },
    sizeChangeHandle: function (val) {
      this.pageSize = val;
      this.pageIndex = 1;
      this.loadDataList();
    },
    currentChangeHandle: function (val) {
      this.pageIndex = val;
      this.loadDataList();
    },
    addHandle: function () {
      this.addOrUpdateVisible = true;
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init();
      })
    },
    updateHandle: function (id, systemic) {
      this.addOrUpdateVisible = true;
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(id, systemic);
      })
    },
    deleteHandle: function(id) {
      let that = this;
      let ids = id
          ? [id]
          : that.dataListSelections.map(item => {
            return item.id;
          });
      if (ids.length == 0) {
        that.$message({
          message: 'レコードが選択されていません',
          type: 'warning',
          duration: 1200
        });
      } else {
        that.$confirm(`選択したレコードを削除してもよろしいですか？`, {
          confirmButtonText: 'YES',
          cancelButtonText: 'NO',
          type: 'warning'
        }).then(() => {
          that.$http('role/deleteRoleByIds', 'POST', { ids: ids }, true, function(resp) {
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
      }
    },

  },
  created() {
    this.loadDataList();
  }
};
</script>

<style></style>
