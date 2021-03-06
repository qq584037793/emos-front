<template>
    <div>
        <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="dataForm" class="form">
            <el-form-item prop="date">
                <el-date-picker
                    v-model="dataForm.date"
                    type="date"
                    placeholder="日付選択"
                    class="input"
                    size="medium"
                ></el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-button size="medium" type="primary" @click="searchHandle()">Search</el-button>
                <el-button size="medium" type="danger" @click="addHandle()">Add</el-button>
            </el-form-item>
            <el-form-item class="mold">
                <el-radio-group v-model="dataForm.mold" size="medium" @change="changeHandle">
                    <el-radio-button label="全部会議"></el-radio-button>
                    <el-radio-button label="私の会議"></el-radio-button>
                </el-radio-group>
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
            <el-table-column width="40px" prop="desc" header-align="center" align="center" type="expand">
                <template #default="scope">
                  会議内容：{{ scope.row.desc }}
                </template>
            </el-table-column>
            <el-table-column type="index" header-align="center" align="center" width="100" label="ナンバー">
                <template #default="scope">
                    <span>{{ (pageIndex - 1) * pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="title" header-align="center" align="center" label="テーマ" min-width="400" />
            <el-table-column prop="creatorName" header-align="center" align="center" min-width="150"  label="クリエーター" />
            <el-table-column prop="date" header-align="center" align="center" min-width="150"  label="日付" />
            <el-table-column header-align="center" align="center" min-width="150"  label="時間">
                <template #default="scope">
                    <span>{{ scope.row.start }} ~ {{ scope.row.end }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="num" header-align="center" align="center" min-width="100"  label="人数" />
            <el-table-column prop="status" header-align="center" align="center" min-width="100" label="状態" />
            <el-table-column header-align="center" align="center" width="150" label="操作">
                <template #default="scope">
                    <el-button
                        type="text"
                        size="medium"
                        :disabled="!scope.row.canEnterMeeting"
                        @click="enterHandle(scope.row.id, scope.row.uuid)"
                    >
                      入る
                    </el-button>
                    <el-button
                        type="text"
                        size="medium"
                        :disabled="
                            !(
                                (scope.row.status == '待审批' || scope.row.status == '未开始') &&
                                scope.row.isCreator == 'true'
                            )
                        "
                        @click="deleteHandle(scope.row)"
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
        <add v-if="addVisible" ref="add" @refresh="refresh"></add>
    </div>
</template>

<script>
import Add from './online_meeting-add.vue';
import dayjs from 'dayjs';

export default {
    components: { Add },
    data: function() {
        return {
            dataForm: {
                date: null,
                mold: '全部会議'
            },
            dataList: [],
            pageIndex: 1,
            pageSize: 10,
            totalCount: 0,
            dataListLoading: false,
            addVisible: false,
            dataRule: {}
        };
    },
    methods: {
      loadDataList: function() {
        let that = this;
        that.dataListLoading = true;
        let data = {
          mold: that.dataForm.mold,
          page: that.pageIndex,
          length: that.pageSize
        };
        if (that.dataForm.date != null && that.dataForm.date != '') {
          data.date = dayjs(that.dataForm.date).format('YYYY-MM-DD');
        }
        that.$http('meeting/searchOnlineMeetingByPage', 'POST', data, true, function(resp) {
          let page = resp.page;
          for (let one of page.list) {
            if (one.status == 1) {
              one.status = '待审批';
            } else if (one.status == 3) {
              one.status = '未開始';
            } else if (one.status == 4) {
              one.status = '会議中';
            } else if (one.status == 5) {
              one.status = '終わり';
            }
            //计算会议是否可以进入
            //1.开会前15分钟可以进入会议室
            //2.会议状態必须是未开始或者进行中
            let minute = dayjs(new Date()).diff(dayjs(`${one.date} ${one.start}`), 'minute');
            if (one.mine == 'true' && ((minute >= -10 && minute <= 0 && one.status == '未開始') || one.status == '会議中')) {
              one.canEnterMeeting = true;
            } else {
              one.canEnterMeeting = false;
            }
          }
          that.dataList = page.list;
          that.totalCount = page.totalCount;
          that.dataListLoading = false;
        });
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
      changeHandle: function(val) {
        this.searchHandle();
      },
      refresh: function() {
        this.$refs['dataForm'].resetFields();
        this.loadDataList();
      },

      addHandle: function() {
        this.addVisible = true;
        this.$nextTick(() => {
          this.$refs.add.init();
        });
      },
      enterHandle: function(id, uuid) {
        let that = this;
        that.$router.push({ name: 'MeetingVideo', params: { meetingId: id, uuid: uuid } });
      },

      deleteHandle: function(json) {
        let that = this;
        that.$confirm('この会議を削除しますか？', {
          confirmButtonText: 'YES',
          cancelButtonText: 'NO',
          type: 'warning'
        }).then(() => {
          let data = {
            id: json.id,
            uuid: json.uuid,
            instanceId: json.instanceId,
            reason: '删除会议申请'
          };
          that.$http('meeting/deleteMeetingApplication', 'post', data, true, function(resp) {
            if (resp.rows == 1) {
              that.$message({
                message: 'success',
                type: 'success',
                duration: 1200
              });
              that.searchHandle();
            } else {
              that.$message({
                message: 'failed',
                type: 'error',
                duration: 1200
              });
            }
          });
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


    },
    created: function() {
        this.loadDataList();

    }
};
</script>

<style lang="less" scoped="scoped">
@import url('online_meeting.less');
</style>
