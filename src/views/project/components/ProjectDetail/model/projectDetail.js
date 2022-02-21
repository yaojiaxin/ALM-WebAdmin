import { mapGetters } from 'vuex'
import { getLinkedByType } from './utils'
// eslint-disable-next-line no-unused-vars
import { moveToNewDomain, deActiveProject, activeProject, updateProject } from '@/api/project'
import { eventEmitter } from '../../../event'

export default {
  inject: {
    projectTree: {
      default: ''
    }
  },
  data() {
    return {
      submitting: false,
      isDisabled: true,
      isFirst: true,
      linkedTemplate: 'N/A',
      linkedNumber: 0
    }
  },
  watch: {
    form: {
      handler(val) {
        if (!this.isFirst) {
          this.isDisabled = false
        } else {
          this.isFirst = false
        }
      },
      deep: true
    }
  },
  computed: {
    ...mapGetters(['selectTreeNode', 'domainList']),
    isActive: function() {
      return this.selectTreeNode && this.selectTreeNode.data['is-active']
    },

    selectNodeType() {
      return this.selectTreeNode && this.selectTreeNode.data['is-template'] ? 'template' : 'project'
    },

    versioning() {
      return this.form['has-vcs-db'] === 0 ? this.$t('disable') : this.$t('Enable')
    },

    updateAble() {
      return this.checkPermission(['MY_CUSTOMER_CONTEXT_PROJECT_DETAILS_UPDATE'], ['SWITCHED_CUSTOMER_CONTEXT_PROJECT_DETAILS_UPDATE'])
    }
  },
  methods: {
    // Determine whether the project is active, and disable the project if it is
    projectIsActive(isChangeNodeStatus = false, isLabProject = false) {
      const selectedProject = this.selectTreeNode.data
      return new Promise((resolve, reject) => {
        if (this.isActive) {
          this.$mfConfirm({
            message: isLabProject ? this.$t('project.deactivateProjectLabBeforeRemove', { name: selectedProject.name }) : this.$t('project.moveProjectDeactivateProject'),
            onConfirm: () => {
              if (isChangeNodeStatus) {
                return this.$store.dispatch('project/deactiveProject', selectedProject)
              } else {
                return deActiveProject({
                  domain: selectedProject['domain-name'],
                  project: selectedProject.name
                })
              }
            },
            onCancelChange: () => { this.submitting = false },
            callback: resolve
          })
        } else {
          resolve()
        }
      })
    },

    getLinked(isTemplate, domain, project) {
      getLinkedByType(isTemplate, domain, project).then(res => {
        if (isTemplate) {
          this.linkedNumber = res.length
        } else {
          this.linkedTemplate = res
        }
      })
    },

    async moveProject(domainName, newDomain, projectName, isTemplate) {
      const project = await moveToNewDomain({
        domain: domainName,
        project: projectName,
        data: {
          domain: { name: newDomain }
        }
      })
      // this.projectTree.$refs.projectTree.reload() // reload project tree

      eventEmitter.emit('setTreeSelect', {
        data: {
          level: 3,
          data: {
            name: projectName,
            key: `${project.project.id}`,
            'domain-name': project.project['domain-name'],
            'is-template': isTemplate
          }
        }
      })

      return project
    },

    async onSaveProject() {
      this.$refs.projectForm.$children[0].validate(async valid => {
        if (!valid) {
          return false
        }
        this.submitting = true

        const selectTreeNode = this.selectTreeNode.data
        let isActive = this.isActive
        let project = { project: selectTreeNode }

        try {
          const domainName = selectTreeNode['domain-name']
          const { name } = this.form

          // if rename, deactive project
          if (selectTreeNode.name + '' !== name + '' && isActive) {
            try {
              await this.projectIsActive()
              isActive = false
              project = { project: { ...selectTreeNode, 'is-active': false }}
            } catch (e) {
              console.log(e)
            }
          }

          // move project to new domain
          if (this.form['domain-name'] !== domainName) {
            if (isActive) {
              try {
                await this.projectIsActive()
                isActive = false
                project = { project: { ...selectTreeNode, 'is-active': false }}
              } catch (e) {
                console.log(e)
              }
            }
          }

          project = await updateProject({
            domain: domainName,
            project: selectTreeNode.name,
            data: {
              name: selectTreeNode.name + '' !== name + '' ? name : undefined, // change name
              'is-auto-mail-enabled': this.form['is-auto-mail-enabled'],
              description: this.form.description,
              'users-quota': this.isLimited ? this.maximum : -1,
              'is-qpm-auto-calc-enabled': this.form['is-qpm-auto-calc-enabled'],
              'search-language': this.form['search-language'],
              'has-vcs-db': !!this.form['has-vcs-db'],
              'exception-file': this.form['exception-file'],
              'db-connstr-format': this.form['db-connstr-format'],
              'db-type': this.dbType
            }
          })

          // if move project, 'this.form' changed, 'isFormNoChange' turned 'true', component deactivated will show message of 'warningNoSave', so 'this.initForm' need update
          // only update 'this.initForm', watch 'this.form' will not trigger, 'isFormNoChange' is still 'false', so 'this.form' need update firstly
          this.form = JSON.parse(JSON.stringify(this.form))
          this.initForm = JSON.parse(JSON.stringify(this.form))

          if (this.form['domain-name'] !== domainName) {
            const newDomain = this.form['domain-name']
            try {
              project = await this.moveProject(domainName, newDomain, project.project.name, selectTreeNode['is-template'], project.project)
            } catch (e) {
              console.log(e)
            }
          }

          if (this.isActive && !isActive) {
            try {
              project = await activeProject({
                domain: project.project['domain-name'],
                project: project.project.name
              })
            } catch (e) {
              console.log(e)
            }

            // return this.$store.dispatch('project/activeProject', project.project)
          }

          if (selectTreeNode.name !== name) {
            this.selectTreeNode.data = { ...this.selectTreeNode.data, ...project.project }

            this.$store.commit('project/SET_SELECTTREENODE', this.selectTreeNode)
            eventEmitter.emit('updateProjectNode', project.project)
          }
          this.submitting = false
          this.$message.success(this.$t('project.project_update_success'))
          // remove projects don't get detail after save
          if (this.form['domain-name'] === domainName) {
            this.getProjectDetail()
          }
        } catch (e) {
          this.selectTreeNode.data = { ...this.selectTreeNode.data, ...project.project }
          this.$store.commit('project/SET_SELECTTREENODE', this.selectTreeNode)
          eventEmitter.emit('updateProjectNode', this.selectTreeNode.data)
          this.submitting = false
        }
      })
    }
  }
}
