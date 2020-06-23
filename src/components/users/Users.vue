<template>
  <div>
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 搜索 添加 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            clearable
            placeholder="请输入内容"
            class="input-with-select"
            v-model="queryInfo.query"
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 表格主体 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="电子邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template v-slot:default="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateCahnged(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot:default="scope2">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope2.row)"
            ></el-button>
            <el-button
              slot="reference"
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope2.row.id)"
            ></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope2.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页主体 -->
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

    <!-- 添加用户 对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 对话框 内容区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="姓名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框 底部操作区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户信息 对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 对话框 内容区域 -->
      <el-form
        :model="editForm"
        :rules="addFormRules"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="姓名" prop="username">
          <el-input disabled v-model="editForm.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框 底部操作区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色 对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRolesDialogVisible"
      width="50%"
      @close="setRolesDialogClosed"
    >
      <!-- 对话框 内容区域 -->
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="newRole" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <!-- 对话框 底部操作区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 自定义邮箱验证规则
    const checkEmail = (rule, val, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(val)) return cb()
      cb(new Error('请输入合法的邮箱'))
    }
    // 自定义手机号验证规则
    const checkMobile = (rule, val, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(val)) return cb()
      cb(new Error('请输入合法的手机号'))
    }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名长度在3～10之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '用户名长度在6～15之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      editForm: {
        username: '',
        email: '',
        mobile: ''
      },
      setRolesDialogVisible: false,
      userInfo: {},
      rolesList: [],
      newRole: null
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      // 获取用户列表
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.userList = res.data.users
      this.total = res.data.total
      this.pagenum = res.data.pagenum
    },
    handleSizeChange(val) {
      // 监听表格每页显示条目个数改变
      this.queryInfo.pagesize = val
      this.getUserList()
    },
    handleCurrentChange(val) {
      // 监听当前页码改变
      this.queryInfo.pagenum = val
      this.getUserList()
    },
    async userStateCahnged(userinfo) {
      // 更新用户状态
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error(res.meta.msg)
      }
      this.$message.success('用户状态更新成功')
    },
    addDialogClosed() {
      // 监听添加用户对话框的关闭事件
      this.$refs.addFormRef.resetFields()
    },
    addUser() {
      // 添加用户
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success('添加用户成功')
        this.addDialogVisible = false
        this.getUserList()
      })
    },
    async showEditDialog(info) {
      // 监听编辑按钮点击事件
      const { data: res } = await this.$http.get('users/' + info.id)
      if (res.meta.status !== 200) return this.$message.error('查询用户信息失败！')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editDialogClosed() {
      // 监听修改用户对话框关闭事件
      this.$refs.editFormRef.resetFields()
    },
    editUser() {
      // 修改用户信息
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `users/${this.editForm.id}`,
          this.editForm
        )
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success('修改用户信息成功')
        this.editDialogVisible = false
        this.getUserList()
      })
    },
    async removeUserById(id) {
      // 根据id删除用户
      const confirmRes = await this.$confirm('此操作将永久删除该用户，是否继续', '提示', {
        distinguishCancelAndClose: true,
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      })
        .catch(err => err)
      if (confirmRes !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete(`users/${id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('删除成功')
      this.getUserList()
    },
    async setRole(userInfo) {
      // 展示分配角色对话框
      this.userInfo = userInfo

      // 获取角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.rolesList = res.data

      this.setRolesDialogVisible = true
    },
    async saveRoleInfo() {
      // 分配用户角色
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.newRole })
      if (res.meta.status !== 200) return this.$message.error('分配用户角色失败')
      this.setRolesDialogVisible = false
      this.$message.success('分配用户角色成功')
      this.getUserList()
    },
    setRolesDialogClosed() {
      // 监听分配角色对话框关闭事件
      this.newRole = null
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 10px;
}
.el-pagination {
  margin: 10px 0;
}
</style>
