<template>
  <div>
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" :show-index="true" index-text="#" border :show-row-hover="false">
        <!-- 是否有效 -->
        <template v-slot:isOk="slotProps">
          <i style="color: lightgreen;" v-if="slotProps.row.cat_deleted === false" class="el-icon-success"></i>
          <i style="color:red;" v-else class="el-icon-error"></i>
        </template>
        <!-- 排序 -->
        <template v-slot:order="slotProps">
          <el-tag v-if="slotProps.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag v-else-if="slotProps.row.cat_level === 1" size="mini" type="success">二级</el-tag>
          <el-tag v-else size="mini" type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template v-slot:opt="slotProps">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditCateDialog(slotProps.row)">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteCate(slotProps.row)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类 对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 对话框 内容区域 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类" prop="cat_pid">
          <el-cascader
            clearable
            style="width: 100%;"
            v-model="selectedKeys"
            :options="pCateList"
            :props="cascaderProps"
            @change="pCateIdChange"
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <!-- 对话框 底部操作区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类 对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateDialogClosed"
    >
      <!-- 对话框 内容区域 -->
      <el-form
        :model="editCateForm"
        :rules="addCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框 底部操作区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [],
      queryInfo: {
        type: '3',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        {
          label: '是否有效',
          // 当前列 自定义模板
          type: 'template',
          template: 'isOk'
        },
        {
          label: '排序',
          // 当前列 自定义模板
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          // 当前列 自定义模板
          type: 'template',
          template: 'opt'
        }
      ],
      addCateDialogVisible: false,
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      cascaderProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      pCateList: [],
      selectedKeys: [],
      editCateForm: {
        cat_name: '',
        cat_id: '',
        cat_pid: '',
        cat_level: ''
      },
      editCateDialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      // 获取商品分类列表
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败！')
      this.cateList = res.data.result
      this.total = res.data.total
    },
    handleSizeChange(val) {
      // 监听表格每页显示条目个数改变
      this.queryInfo.pagesize = val
      this.getCateList()
    },
    handleCurrentChange(val) {
      // 监听当前页码改变
      this.queryInfo.pagenum = val
      this.getCateList()
    },
    async showAddCateDialog() {
      // 监听添加分类按钮点击事件,获取父级分类列表
      const { data: res } = await this.$http.get('categories', { params: { type: '2' } })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类列表失败')
      this.pCateList = res.data
      this.addCateDialogVisible = true
    },
    addCateDialogClosed() {
      // 监听添加分类对话框关闭事件
      this.$refs.addCateFormRef.resetFields()
      this.addCateForm = {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      }
      this.selectedKeys = []
    },
    pCateIdChange() {
      // 父级分类值发生改变时
      if (this.selectedKeys && this.selectedKeys.length) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      }
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    addCate() {
      // 添加分类
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) return this.$message.error('添加商品分类失败')
        this.$message.success('添加商品分类成功')
        this.addCateDialogVisible = false
        this.getCateList()
      })
    },
    async showEditCateDialog(cate) {
      // 监听编辑分类按钮点击事件,根据id查询分类信息
      const { data: res } = await this.$http.get(`categories/${cate.cat_id}`)
      if (res.meta.status !== 200) return this.$message.error('获取分类信息失败！')
      this.editCateForm = res.data
      this.editCateDialogVisible = true
    },
    editCateDialogClosed() {
      // 监听编辑分类对话框关闭事件
      this.$refs.editCateFormRef.resetFields()
      this.editCateForm = { cat_id: '', cat_name: '' }
    },
    editCate() {
      // 编辑分类
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.editCateForm.cat_id}`, { cat_name: this.editCateForm.cat_name })
        if (res.meta.status !== 200) return this.$message.error('更新失败')
        this.$message.success('更新成功')
        this.getCateList()
        this.editCateDialogVisible = false
      })
    },
    async deleteCate(cate) {
      // 删除分类信息
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') { return this.$message.info('已取消删除！') }
      const { data: res } = await this.$http.delete('categories/' + cate.cat_id)
      if (res.meta.status !== 200) { return this.$message.error('删除商品分类失败！') }
      this.$message.success('删除商品分类成功！')
      this.getCateList()
    }
  }
}
</script>

<style>
.treeTable{
  margin-top: 15px;
}
</style>
