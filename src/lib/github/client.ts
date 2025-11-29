/**
 * GitHub API Client
 * Manages repository creation and code deployment
 */

import { Octokit } from '@octokit/rest'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_ORG = process.env.GITHUB_ORG

export interface CreateRepoParams {
  name: string
  description: string
  isPrivate: boolean
  userId: string
}

export interface PushCodeParams {
  owner: string
  repo: string
  files: Array<{
    path: string
    content: string
  }>
  commitMessage: string
}

class GitHubClient {
  private octokit: Octokit

  constructor() {
    if (!GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN environment variable is not set')
    }

    this.octokit = new Octokit({
      auth: GITHUB_TOKEN,
    })
  }

  /**
   * Create a new GitHub repository
   */
  async createRepository(params: CreateRepoParams) {
    try {
      const { name, description, isPrivate } = params

      // Create repository
      const { data: repo } = await this.octokit.repos.createForAuthenticatedUser({
        name,
        description,
        private: isPrivate,
        auto_init: true, // Initialize with README
      })

      console.log(`Created repository: ${repo.full_name}`)

      return {
        success: true,
        repoUrl: repo.html_url,
        cloneUrl: repo.clone_url,
        owner: repo.owner.login,
        name: repo.name,
        fullName: repo.full_name,
      }
    } catch (error: any) {
      console.error('Error creating repository:', error)
      throw new Error(`Failed to create repository: ${error.message}`)
    }
  }

  /**
   * Push code files to repository
   */
  async pushCode(params: PushCodeParams) {
    try {
      const { owner, repo, files, commitMessage } = params

      // Get the default branch
      const { data: repoData } = await this.octokit.repos.get({
        owner,
        repo,
      })
      const defaultBranch = repoData.default_branch

      // Get the latest commit SHA
      const { data: refData } = await this.octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${defaultBranch}`,
      })
      const latestCommitSha = refData.object.sha

      // Get the tree SHA from the latest commit
      const { data: commitData } = await this.octokit.git.getCommit({
        owner,
        repo,
        commit_sha: latestCommitSha,
      })
      const baseTreeSha = commitData.tree.sha

      // Create blobs for all files
      const blobs = await Promise.all(
        files.map(async (file) => {
          const { data: blob } = await this.octokit.git.createBlob({
            owner,
            repo,
            content: Buffer.from(file.content).toString('base64'),
            encoding: 'base64',
          })
          return {
            path: file.path,
            mode: '100644' as const,
            type: 'blob' as const,
            sha: blob.sha,
          }
        })
      )

      // Create a new tree
      const { data: newTree } = await this.octokit.git.createTree({
        owner,
        repo,
        base_tree: baseTreeSha,
        tree: blobs,
      })

      // Create a new commit
      const { data: newCommit } = await this.octokit.git.createCommit({
        owner,
        repo,
        message: commitMessage,
        tree: newTree.sha,
        parents: [latestCommitSha],
      })

      // Update the reference
      await this.octokit.git.updateRef({
        owner,
        repo,
        ref: `heads/${defaultBranch}`,
        sha: newCommit.sha,
      })

      console.log(`Pushed ${files.length} files to ${owner}/${repo}`)

      return {
        success: true,
        commitSha: newCommit.sha,
        commitUrl: newCommit.html_url,
      }
    } catch (error: any) {
      console.error('Error pushing code:', error)
      throw new Error(`Failed to push code: ${error.message}`)
    }
  }

  /**
   * Delete a repository
   */
  async deleteRepository(owner: string, repo: string) {
    try {
      await this.octokit.repos.delete({
        owner,
        repo,
      })

      console.log(`Deleted repository: ${owner}/${repo}`)

      return { success: true }
    } catch (error: any) {
      console.error('Error deleting repository:', error)
      throw new Error(`Failed to delete repository: ${error.message}`)
    }
  }

  /**
   * Check if repository exists
   */
  async repositoryExists(owner: string, repo: string): Promise<boolean> {
    try {
      await this.octokit.repos.get({
        owner,
        repo,
      })
      return true
    } catch (error: any) {
      if (error.status === 404) {
        return false
      }
      throw error
    }
  }

  /**
   * Get repository details
   */
  async getRepository(owner: string, repo: string) {
    try {
      const { data } = await this.octokit.repos.get({
        owner,
        repo,
      })

      return {
        name: data.name,
        fullName: data.full_name,
        description: data.description,
        url: data.html_url,
        cloneUrl: data.clone_url,
        defaultBranch: data.default_branch,
        isPrivate: data.private,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    } catch (error: any) {
      console.error('Error getting repository:', error)
      throw new Error(`Failed to get repository: ${error.message}`)
    }
  }
}

// Export singleton instance
export const github = new GitHubClient()
