<template>
  <el-dialog title="オフライン会議申請" :close-on-click-modal="false" v-model="visible" width="692px">
    <el-form :model="dataForm" ref="dataForm" :rules="dataRule" label-width="60px">
      <el-form-item label="名前" prop="title">
        <el-input v-model="dataForm.title" size="medium" style="width:100%" clearable="clearable"/>
      </el-form-item>
      <el-form-item label="内容" prop="desc">
        <el-input
            type="textarea"
            :rows="2"
            placeholder="内容入力"
            v-model="dataForm.desc"
            size="medium"
            resize="none"
            maxlength="200"
            clearable="clearable"
        />
      </el-form-item>
      <el-form-item label="日付" prop="date">
        <el-date-picker
            v-model="dataForm.date"
            type="date"
            placeholder="日付選択"
            style="width:34.5%"
            size="medium"
            :disabledDate="disabledDate"
            clearable="clearable"
            @change="loadPlaceList()"
        ></el-date-picker>
        <span class="note">会議の日付は、過去の日付ではなく、現在または将来の日付のみにすることができます</span>
      </el-form-item>

      <el-form-item label="時間">
        <el-col :span="11">
          <el-form-item prop="start" class="inner-item">
            <el-time-select
                placeholder="始まる時間"
                v-model="dataForm.start"
                start="08:30"
                step="00:30"
                end="18:30"
                size="medium"
                style="width:96%"
                clearable="clearable"
                @change="loadPlaceList()"
            ></el-time-select>
          </el-form-item>
        </el-col>
        <el-col :span="2">&nbsp;&nbsp;~&nbsp;&nbsp;</el-col>
        <el-col :span="11" prop="end">
          <el-form-item prop="end" class="inner-item">
            <el-time-select
                placeholder="終了時間"
                v-model="dataForm.end"
                start="08:30"
                step="00:30"
                end="18:30"
                size="medium"
                style="width:96%"
                clearable="clearable"
                :minTime="dataForm.start"
                @change="loadPlaceList()"
            ></el-time-select>
          </el-form-item>
        </el-col>
        <span class="note">会議の時間枠に注意してください</span>
      </el-form-item>
      <el-form-item label="場所" prop="place">
        <el-select
            v-model="dataForm.place"
            placeholder="会議室"
            size="medium"
            style="width:34.5%"
            clearable="clearable"
        >
          <el-option v-for="one in placeList" :label="one" :value="one"></el-option>
        </el-select>
        <span class="note">リスト内の会議室を選択してください</span>
      </el-form-item>
      <el-form-item label="メンバー" prop="members">
        <el-transfer
            v-model="dataForm.members"
            :data="users"
            :titles="['スタッフ', '参加者']"
            filterable
            filter-placeholder="名前入力"
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
import dayjs from 'dayjs';

export default {
  data: function () {
    return {
      visible: false,
      dataForm: {
        title: null,
        date: null,
        start: null,
        end: null,
        place: null,
        desc: null,
        members: [],
        type: 2
      },

      disabledDate(date) {
        return date.getTime() < Date.now() - 24 * 60 * 60 * 1000;
      },

      placeList: [],
      users: [],
      dataRule: {
        title: [{required: true}],
        desc: [{required: true}],
        date: [{required: true}],
        start: [{required: true}],
        end: [{required: true}],
        place: [{required: true}],
        members: [
          {required: true, trigger: 'blur'},
          {required: false, trigger: 'change'}
        ]
      }
    };
  },

  methods: {
    loadPlaceList: function() {
      let that = this;
      that.dataForm.place = null;
      that.placeList = [];
      if (
          that.dataForm.date == null ||
          that.dataForm.date == '' ||
          that.dataForm.start == null ||
          that.dataForm.start == '' ||
          that.dataForm.end == null ||
          that.dataForm.end == ''
      ) {
        return;
      }
      let data = {
        date: dayjs(that.dataForm.date).format('YYYY-MM-DD'),
        start: that.dataForm.start,
        end: that.dataForm.end
      };
      that.$http('meeting_room/searchFreeMeetingRoom', 'POST', data, true, function(resp) {
        that.placeList = resp.list;
      });
    },
    init: function (id) {
      let that = this;
      that.visible = true;
      that.$nextTick(() => {
        that.$refs['dataForm'].resetFields();
        that.$http('user/searchAllUser', 'GET', null, true, function (resp) {
          let temp = [];
          for (let one of resp.list) {
            temp.push({key: one.id, label: one.name});
          }
          that.users = temp;
        });
      });
    },
    dataFormSubmit: function() {
      let that = this;
      let data = that.dataForm;
      data.date = dayjs(that.dataForm.date).format('YYYY-MM-DD');
      data.members = JSON.stringify(that.dataForm.members);
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          that.$http('meeting/insert', 'POST', data, true, function(resp) {
            if (resp.rows == 1) {
              that.visible = false;
              that.$message({
                message: 'success',
                type: 'success',
                duration: 1200
              });
              setTimeout(function() {
                that.$emit('refresh'); //加载最新数据
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
</style>
