<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 角色列表 -->
    <el-card>
      <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot:default="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <el-col :span="5">
                <el-tag closable @close="deleteRightsById(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag closable type="success" @close="deleteRightsById(scope.row, item2.id)">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag closable type="warning" v-for="item3 in item2.children" :key="item3.id" @close="deleteRightsById(scope.row, item3.id)">
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 最外层索引列 -->
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row)"
              >编辑</el-button
            >
            <el-button
              slot="reference"
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRole(scope.row)"
              >删除</el-button
            >
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色 对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 对话框 内容区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框 底部操作区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色 对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 对话框 内容区域 -->
      <el-form
        :model="editForm"
        :rules="addFormRules"
        ref="editFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框 底部操作区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限 对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightsDialogVisible"
      width="50%"
      @close="setRightsDialogClosed"
    >
      <!-- 权限树 -->
      <el-tree
        :data="rightsList"
        show-checkbox
        node-key="id"
        default-expand-all
        ref="treeRef"
        :default-checked-keys="defKeys"
        :props="treeProps">
      </el-tree>
      <!-- 对话框 底部操作区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      addDialogVisible: false,
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      editForm: {
        roleName: '',
        roleDesc: ''
      },
      editDialogVisible: false,
      setRightsDialogVisible: false,
      rightsList: [],
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      defKeys: [],
      roleId: 0
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      // 获取角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.rolesList = res.data
    },
    addDialogClosed() {
      // 监听添加角色对话框关闭事件
      this.$refs.addFormRef.resetFields()
    },
    addRole() {
      // 添加角色
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.getRolesList()
        this.addDialogVisible = false
        this.$message.success('添加角色成功！')
      })
    },
    editDialogClosed() {
      // 监听编辑角色对话框关闭事件
      this.$refs.editFormRef.resetFields()
    },
    async showEditDialog(info) {
      // 监听编辑按钮点击事件
      const { data: res } = await this.$http.get(`roles/${info.id}`)
      if (res.meta.status !== 200) return this.$message.error('查询角色信息失败')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editRole() {
      // 编辑角色信息
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`roles/${this.editForm.roleId}`, this.editForm)
        if (res.meta.status !== 200) return this.$message.error('编辑角色信息失败')
        this.$message.success('编辑角色信息成功')
        this.editDialogVisible = false
        this.getRolesList()
      })
    },
    async deleteRole(info) {
      // 删除角色
      const confirmRes = await this.$confirm('此操作将永久删除当前角色，是否继续', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmRes !== 'confirm') return this.$message.info('已取消删除操作')
      const { data: res } = await this.$http.delete(`roles/${info.id}`)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败！')
      this.$message.success('删除角色成功！')
      this.getRolesList()
    },
    async deleteRightsById(roleInfo, id) {
      // 根据id删除角色权限
      const confirmRes = await this.$confirm(
        '此操作将永久删除该权限，是否继续？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmRes !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete(`roles/${roleInfo.id}/rights/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除权限失败！')
      roleInfo.children = res.data
      // this.getRolesList()
    },
    async showSetRightDialog(info) {
      // 监听分配权限按钮点击事件
      // 获取所有权限列表
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
      this.rightsList = res.data
      this.setRightsDialogVisible = true
      this.getLeafkeys(info, this.defKeys)
      this.roleId = info.id
    },
    getLeafkeys(info, arr) {
      // 获取当前角色的所有权限id
      if (!info.children) {
        return arr.push(info.id)
      }
      info.children.forEach(item => this.getLeafkeys(item, arr))
    },
    setRightsDialogClosed() {
      // 监听分配权限对话框关闭事件
      this.defKeys = []
    },
    async setRights() {
      // 设置角色权限
      const rights = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const rids = rights.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids })
      if (res.meta.status !== 200) return this.$message.error('角色授权失败！')
      this.$message.success('角色授权成功')
      this.getRolesList()
      this.setRightsDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-button {
  margin-bottom: 10px;
}
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
