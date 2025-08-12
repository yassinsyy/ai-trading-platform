import { Controller, Post, Get, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RollingSimService } from './rolling-sim.service';
import { CompetitorReactionService, ReactionSimulation } from './competitor-reaction';
import {
  CreateSimulationScenarioDto,
  CompetitorAnalysisDto,
  CompetitorSimulationDto,
  SimulationResponseDto,
  SimulationStateDto,
} from './dto/simulation.dto';

@ApiTags('Simulation')
@Controller('simulation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SimController {
  constructor(
    private readonly rollingSimService: RollingSimService,
    private readonly competitorReactionService: CompetitorReactionService,
  ) {}

  @Post('scenario')
  @ApiOperation({ summary: 'Create and run a new simulation scenario' })
  @ApiResponse({ status: 201, description: 'Simulation started successfully', type: SimulationResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid scenario parameters' })
  async createAndRunScenario(
    @Body() scenario: CreateSimulationScenarioDto
  ): Promise<SimulationResponseDto> {
    const simulationScenario = {
      id: `scenario_${Date.now()}`,
      ...scenario,
      createdAt: new Date().toISOString(),
      status: 'PENDING' as const,
    };

    // Здесь нужно получить initialData из базы данных
    // Пока используем пустой массив
    const initialData: any[] = [];

    const result = await this.rollingSimService.runRollingSimulation(
      simulationScenario,
      initialData,
      scenario.horizon,
      scenario.stepSize
    );

    return {
      success: true,
      scenarioId: simulationScenario.id,
      result,
    };
  }

  @Get('scenarios')
  @ApiOperation({ summary: 'Get all simulation scenarios' })
  @ApiResponse({ status: 200, description: 'List of scenarios retrieved' })
  async getScenarios() {
    const activeSimulations = this.rollingSimService.getActiveSimulations();
    const simulationState = this.rollingSimService.getSimulationState();

    return {
      activeSimulations: Array.from(activeSimulations.entries()).map(([id, sim]) => ({
        id,
        scenarioId: sim.scenarioId,
        startTime: sim.startTime,
        endTime: sim.endTime,
        status: sim.endTime ? 'COMPLETED' : 'RUNNING',
        summary: sim.summary,
      })),
      currentState: simulationState,
    };
  }

  @Get('scenario/:id')
  @ApiOperation({ summary: 'Get simulation results by scenario ID' })
  @ApiResponse({ status: 200, description: 'Simulation results retrieved' })
  @ApiResponse({ status: 404, description: 'Simulation not found' })
  async getScenarioResults(@Param('id') id: string) {
    const activeSimulations = this.rollingSimService.getActiveSimulations();
    const simulation = activeSimulations.get(id);

    if (!simulation) {
      return { error: 'Simulation not found' };
    }

    return simulation;
  }

  @Get('state')
  @ApiOperation({ summary: 'Get current simulation state' })
  @ApiResponse({ status: 200, description: 'Current state retrieved' })
  async getSimulationState() {
    return this.rollingSimService.getSimulationState();
  }

  @Post('competitor-analysis')
  @ApiOperation({ summary: 'Analyze competitor reaction patterns' })
  @ApiResponse({ status: 200, description: 'Analysis completed', type: SimulationResponseDto })
  async analyzeCompetitorReactions(
    @Body() data: CompetitorAnalysisDto
  ): Promise<SimulationResponseDto> {
    // Создаем пустой массив реакций для анализа
    const emptyReactions: ReactionSimulation[] = [];
    const patterns = await this.competitorReactionService.analyzeCompetitorReactionPatterns(
      emptyReactions
    );

    return {
      success: true,
      result: patterns,
    };
  }

  @Post('competitor-simulation')
  @ApiOperation({ summary: 'Simulate competitor reactions' })
  @ApiResponse({ status: 200, description: 'Simulation completed', type: SimulationResponseDto })
  async simulateCompetitorReactions(
    @Body() data: CompetitorSimulationDto
  ): Promise<SimulationResponseDto> {
    const reactions = await this.competitorReactionService.simulateCompetitorReactions(
      data.priceChange,
      data.priceChange,
      [{ id: data.skuId, currentPrice: 100, model: { responseProbability: 0.3, priceChangeDelta: 0.1, responseDelay: 2, aggressiveness: 'medium' } }],
      data.timestamp
    );

    return {
      success: true,
      result: reactions,
    };
  }

  @Delete('scenario/:id')
  @ApiOperation({ summary: 'Delete simulation scenario' })
  @ApiResponse({ status: 200, description: 'Scenario deleted successfully' })
  async deleteScenario(@Param('id') id: string) {
    const activeSimulations = this.rollingSimService.getActiveSimulations();
    const deleted = activeSimulations.delete(id);

    return {
      success: deleted,
      message: deleted ? 'Scenario deleted successfully' : 'Scenario not found',
    };
  }

  @Post('cleanup')
  @ApiOperation({ summary: 'Clean up completed simulations' })
  @ApiResponse({ status: 200, description: 'Cleanup completed' })
  async cleanupSimulations() {
    this.rollingSimService.cleanupCompletedSimulations();
    
    return {
      success: true,
      message: 'Cleanup completed',
    };
  }
}
