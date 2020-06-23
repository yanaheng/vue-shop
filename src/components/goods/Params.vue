<template>
  <div>
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleCascaderChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- 参数标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleTabsClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button size="mini" type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
          <el-table
            :data="manyList"
            style="width: 100%; margin-top: 15px;" border stripe>
            <el-table-column type="expand">
              <template v-slot:default="props">
                <el-tag
                  :key="tag"
                  v-for="(tag, i) in props.row.attr_vals"
                  closable
                  :disable-transitions="false"
                  @close="handleClose(i, props.row)"
                  >
                  {{tag}}
                </el-tag>
                <el-input
                style="width: 90px;"
                v-if="props.row.inputVisible"
                v-model="props.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(props.row)"
                @blur="handleInputConfirm(props.row)"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput(props.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button size="mini" type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
          <el-table
            :data="onlyList"
            style="width: 100%; margin-top: 15px;" border stripe>
            <el-table-column type="expand">
              <template v-slot:default="props">
                <el-tag
                  :key="tag"
                  v-for="(tag, i) in props.row.attr_vals"
                  closable
                  :disable-transitions="false"
                  @close="handleClose(i, props.row)"
                  >
                  {{tag}}
                </el-tag>
                <el-input
                style="width: 90px;"
                v-if="props.row.inputVisible"
                v-model="props.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(props.row)"
                @blur="handleInputConfirm(props.row)"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput(props.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数/属性 -->
    <el-dialog
      :title="`添加${titleText}`"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 对话框 内容区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item label="参数名称" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框 底部操作区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数/属性 -->
    <el-dialog
      :title="`修改${titleText}`"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 对话框 内容区域 -->
      <el-form
        :model="editForm"
        :rules="addFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item label="参数名称" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框 底部操作区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover'
      },
      selectedCateKeys: [],
      activeName: 'many',
      manyList: [],
      onlyList: [],
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      addDialogVisible: false,
      editDialogVisible: false,
      editForm: {
        attr_name: '',
        attr_id: ''
      }
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    isBtnDisabled () {
      if (this.selectedCateKeys.length !== 3) return true
      return false
    },
    getCateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    titleText() {
      if (this.activeName === 'many') return '动态参数'
      return '静态属性'
    }
  },
  methods: {
    async getCateList() {
      // 获取分类列表
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取分类列表失败')
      this.cateList = res.data
    },
    handleCascaderChange() {
      // 选择商品分类的事件处理
      this.getParamsList()
    },
    handleTabsClick(node) {
      // 切换tab页的事件处理
      this.activeName = node.name
      this.getParamsList()
    },
    async getParamsList() {
      // 获取参数列表
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyList = []
        this.onlyList = []
        return
      }
      const { data: res } = await this.$http.get(`categories/${this.getCateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
      res.data.forEach(item => {
        //   通过三元表达式判断attr_vals是否为空
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []

        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框的输入值
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyList = res.data
      } else {
        this.onlyList = res.data
      }
    },
    showInput(row) {
      // 点击添加标签btn的事件处理
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    addDialogClosed() {
      // 监听添加参数对话框关闭
      this.$refs.addFormRef.resetFields()
    },
    addParams() {
      // 添加参数/属性
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.getCateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) return this.$message.error('添加参数失败')
        this.$message.success('添加参数成功')
        this.getParamsList()
        this.addDialogVisible = false
      })
    },
    editDialogClosed() {
      // 监听修改参数对话框关闭
      this.$refs.editFormRef.resetFields()
    },
    async showEditDialog(id) {
      // 点击编辑按钮事件处理
      // 获取参数信息
      const { data: res } = await this.$http.get(`categories/${this.getCateId}/attributes/${id}`)
      if (res.meta.status !== 200) return this.$message.error('获取参数信息失败')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editParams() {
      // 编辑参数/属性
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.getCateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) return this.$message.error('修改参数失败')
        this.$message.success('修改参数成功')
        this.getParamsList()
        this.editDialogVisible = false
      })
    },
    async removeParams(id) {
      // 点击删除按钮的事件处理
      console.log(id)
      const confirmRes = await this.$confirm('此操作将永久删除该参数，是否继续', '提示', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      })
        .catch(err => err)
      if (confirmRes !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete(`categories/${this.getCateId}/attributes/${id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('删除成功')
      this.getParamsList()
    },
    handleInputConfirm(row) {
      // 文本框失去焦点,或者按下Enter触发 添加标签 事件处理
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 提交数据库，保存修改
      this.saveAttrVals(row)
    },
    async saveAttrVals (row) {
      // 保存参数可选项
      const { data: res } = await this.$http.put(
        `categories/${this.getCateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败！')
      }
      this.$message.success('修改参数项成功！')
    },
    handleClose(i, row) {
      // 删除参数可选项
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt{
  margin: 15px 0;
}
.el-tag{
  margin: 8px;
}
</style>
