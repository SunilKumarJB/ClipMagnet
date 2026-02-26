# Nano Banana JSON Prompting Guide

A comprehensive reference for creating structured JSON prompts for Gemini 3 Pro Image (Nano Banana Pro) to generate system architecture diagrams, agent workflows, and technical visualizations.

## Table of Contents

1. [Overview](#overview)
2. [Why JSON Prompting](#why-json-prompting)
3. [Core JSON Schema Structure](#core-json-schema-structure)
4. [Component Reference](#component-reference)
5. [Connection Types](#connection-types)
6. [Templates](#templates)
7. [Best Practices](#best-practices)
8. [Examples](#examples)

---

## Overview

**Nano Banana** was the internal codename for Google's image generation models:
- **Nano Banana** = Gemini 2.5 Flash Image
- **Nano Banana Pro** = Gemini 3 Pro Image (gemini-3-pro-image-preview)

These models excel at:
- Technical diagrams and architecture visualizations
- High-fidelity text rendering
- Consistent icon and component styling
- Multi-element compositions with clear relationships

### Model Selection

| Model | Use Case | Context |
|-------|----------|---------|
| `gemini-2.5-flash-image-preview` | Quick iterations, simpler diagrams | 128K tokens |
| `gemini-3-pro-image-preview` | Complex architectures, production quality | 1M tokens |

---

## Why JSON Prompting

Research shows structured prompts improve accuracy by **60-80%** for complex tasks.

| Aspect | Text Prompt | JSON Prompt |
|--------|-------------|-------------|
| Clarity | Adjectives can bleed together | Categories are isolated |
| Control | Limited variable separation | Full control over each element |
| Repeatability | Results vary significantly | Consistent outputs |
| Debugging | Hard to identify issues | Easy to modify specific parts |
| Complexity | Degrades with more elements | Scales well |

---

## Core JSON Schema Structure

Every JSON prompt should follow this skeleton:

```json
{
  "metadata": {},
  "style": {},
  "technical": {},
  "composition": {},
  "diagram": {
    "title": {},
    "layers": [],
    "connections": [],
    "annotations": [],
    "legend": {}
  },
  "quality": {}
}
```

### 1. Metadata Block

Version control and traceability:

```json
{
  "metadata": {
    "prompt_version": "1.0",
    "title": "Descriptive Title",
    "author": "your-name",
    "timestamp": "2025-12-16",
    "output_format": "image/png",
    "tags": ["architecture", "multi-agent", "adk"]
  }
}
```

### 2. Style Block

Visual aesthetics and theming:

```json
{
  "style": {
    "type": "technical_diagram",
    "aesthetic": "modern_tech_dashboard",
    "design_language": "flat_design_with_subtle_gradients",
    "theme": "dark_mode_professional",
    "inspiration": ["Google Cloud diagrams", "AWS architecture"],
    "color_palette": {
      "primary": "#4285F4",
      "secondary": "#34A853",
      "accent_1": "#FBBC04",
      "accent_2": "#EA4335",
      "background": "#1a1a2e",
      "surface": "#16213e",
      "text_primary": "#ffffff",
      "text_secondary": "#a0a0a0",
      "connections": "#6c7b95"
    }
  }
}
```

#### Style Types

| Type | Description |
|------|-------------|
| `technical_diagram` | System architecture, flow charts |
| `infographic` | Data visualization with icons |
| `flowchart` | Process flows, decision trees |
| `network_diagram` | Nodes and connections |
| `sequence_diagram` | Ordered interactions |
| `entity_relationship` | Database schemas |

#### Theme Options

| Theme | Background | Use Case |
|-------|------------|----------|
| `dark_mode_professional` | Dark blue/black | Executive presentations |
| `light_mode_clean` | White/light gray | Documentation |
| `blueprint_technical` | Dark blue grid | Engineering specs |
| `whiteboard_sketch` | Off-white | Brainstorming |

### 3. Technical Block

Rendering specifications:

```json
{
  "technical": {
    "resolution": "4K",
    "aspect_ratio": "16:9",
    "render_quality": "high_fidelity",
    "text_rendering": "crisp_legible",
    "icon_style": "outlined_with_fill",
    "line_weight": "medium",
    "corner_radius": "rounded_8px",
    "shadow_style": "soft_drop_shadow"
  }
}
```

#### Aspect Ratios

| Ratio | Use Case |
|-------|----------|
| `16:9` | Presentations, wide diagrams |
| `4:3` | Documentation, slides |
| `1:1` | Social media, icons |
| `9:16` | Mobile, vertical flows |
| `21:9` | Ultra-wide dashboards |

### 4. Composition Block

Layout and arrangement:

```json
{
  "composition": {
    "layout": "hierarchical_top_down",
    "alignment": "center_justified",
    "spacing": "generous_whitespace",
    "flow_direction": "top_to_bottom",
    "grouping_style": "rounded_containers_with_headers",
    "legend_position": "bottom_right",
    "title_position": "top_center"
  }
}
```

#### Layout Options

| Layout | Description |
|--------|-------------|
| `hierarchical_top_down` | Tree structure, root at top |
| `hierarchical_left_right` | Tree structure, root at left |
| `horizontal_flow` | Left to right process |
| `vertical_flow` | Top to bottom process |
| `radial` | Center node with spokes |
| `grid` | Uniform grid arrangement |
| `free_form` | Organic positioning |

### 5. Diagram Block

The main content definition:

```json
{
  "diagram": {
    "title": {
      "text": "Main Title",
      "subtitle": "Subtitle or description",
      "font_size": "large",
      "font_weight": "bold"
    },
    "layers": [],
    "connections": [],
    "annotations": [],
    "legend": {}
  }
}
```

### 6. Quality Block

Final output quality:

```json
{
  "quality": {
    "detail_level": "high",
    "text_clarity": "maximum",
    "anti_aliasing": true,
    "icon_consistency": "uniform_style",
    "spacing_precision": "pixel_perfect",
    "export_ready": true
  }
}
```

---

## Component Reference

### Layer Structure

Layers organize components vertically or by function:

```json
{
  "layer_id": "unique_layer_id",
  "position": "top|upper_middle|middle|lower_middle|bottom",
  "label": "Layer Display Name",
  "layout": "horizontal_row|vertical_stack|grid_2x2|horizontal_three_column",
  "container_style": {
    "background": "#1e3a5f",
    "border": "#4285F4",
    "border_width": "2px"
  },
  "components": []
}
```

### Component Types

#### 1. Actor (User/External Entity)

```json
{
  "id": "user",
  "type": "actor",
  "label": "User",
  "icon": "person_outline",
  "description": "End user or external system",
  "color": "#ffffff"
}
```

#### 2. Agent (AI Agent)

```json
{
  "id": "coordinator_agent",
  "type": "agent",
  "label": "Coordinator Agent",
  "icon": "hub",
  "description": "Root orchestration agent",
  "model": "gemini-3-pro-preview",
  "color": "#4285F4",
  "size": "large",
  "responsibilities": [
    "Route requests",
    "Coordinate workflows"
  ]
}
```

#### 3. Agent Group (Agent with Tools)

```json
{
  "id": "campaign_agent",
  "type": "agent_group",
  "label": "Campaign Agent",
  "icon": "campaign",
  "color": "#34A853",
  "container_style": {
    "background": "#1e4035",
    "border": "#34A853"
  },
  "description": "Campaign management",
  "tools": [
    {
      "id": "create_campaign",
      "label": "create_campaign",
      "icon": "add_circle",
      "description": "Create new campaign"
    }
  ]
}
```

#### 4. External Service (API)

```json
{
  "id": "gemini_api",
  "type": "external_service",
  "label": "Gemini API",
  "icon": "cloud",
  "color": "#4285F4",
  "provider": "Google AI",
  "description": "LLM and image generation",
  "models": ["gemini-3-pro-preview"]
}
```

#### 5. Database

```json
{
  "id": "sqlite_db",
  "type": "database",
  "label": "SQLite Database",
  "icon": "database",
  "color": "#6c7b95",
  "file": "campaigns.db",
  "tables": [
    {"name": "campaigns", "description": "Campaign definitions"},
    {"name": "metrics", "description": "Performance data"}
  ]
}
```

#### 6. File Storage

```json
{
  "id": "file_storage",
  "type": "file_storage",
  "label": "Generated Files",
  "icon": "folder",
  "color": "#9c7b4a",
  "path": "generated/",
  "contents": ["*.mp4", "*.png"]
}
```

#### 7. Interface (UI/API Endpoint)

```json
{
  "id": "web_ui",
  "type": "interface",
  "label": "Web UI",
  "icon": "web_browser",
  "description": "User interface",
  "color": "#4285F4"
}
```

#### 8. Process (Background Task)

```json
{
  "id": "video_generation",
  "type": "process",
  "label": "Video Generation",
  "icon": "hourglass",
  "description": "Async video processing",
  "duration": "2-5 minutes"
}
```

### Icon Reference

Common icons for technical diagrams:

| Category | Icons |
|----------|-------|
| Users | `person`, `person_outline`, `group`, `groups` |
| Agents | `hub`, `smart_toy`, `psychology`, `auto_awesome` |
| Data | `database`, `storage`, `cloud_upload`, `folder` |
| Media | `image`, `videocam`, `movie_creation`, `photo_library` |
| Analytics | `analytics`, `show_chart`, `insert_chart`, `trending_up` |
| Actions | `add_circle`, `edit`, `delete`, `refresh`, `sync` |
| Navigation | `arrow_forward`, `arrow_back`, `swap_horiz`, `compare_arrows` |
| Status | `check_circle`, `error`, `warning`, `info` |
| Location | `location_on`, `map`, `store`, `place` |
| Communication | `chat`, `email`, `notifications`, `campaign` |

---

## Connection Types

### Connection Structure

```json
{
  "from": "source_component_id",
  "to": "target_component_id",
  "type": "connection_type",
  "label": "Connection Label",
  "style": "solid|dashed|dotted",
  "arrow": "single|bidirectional|none",
  "color": "#4285F4"
}
```

### Connection Type Reference

| Type | Description | Example |
|------|-------------|---------|
| `interaction` | User interaction | User → UI |
| `request` | API request | UI → Agent |
| `response` | API response | Agent → UI |
| `delegation` | Agent delegation | Coordinator → Sub-agent |
| `data_access` | Database query | Agent → Database |
| `api_call` | External API | Agent → Gemini API |
| `file_io` | File read/write | Agent → Storage |
| `artifact_save` | ADK artifact | Agent → Artifacts |
| `event` | Event trigger | System → Handler |
| `display` | Render content | Artifacts → UI |

### Line Styles

| Style | Use Case |
|-------|----------|
| `solid` | Primary/required flow |
| `dashed` | Optional/secondary flow |
| `dotted` | Event/async flow |
| `thick` | High-priority path |

---

## Templates

### Template 1: Multi-Agent Architecture

For ADK-based multi-agent systems:

```json
{
  "metadata": {
    "prompt_version": "1.0",
    "title": "Multi-Agent System Architecture",
    "output_format": "image/png"
  },
  "style": {
    "type": "technical_diagram",
    "aesthetic": "modern_tech_dashboard",
    "theme": "dark_mode_professional",
    "color_palette": {
      "primary": "#4285F4",
      "secondary": "#34A853",
      "accent_1": "#FBBC04",
      "accent_2": "#EA4335",
      "background": "#1a1a2e",
      "surface": "#16213e",
      "text_primary": "#ffffff"
    }
  },
  "technical": {
    "resolution": "4K",
    "aspect_ratio": "16:9",
    "icon_style": "outlined_with_fill"
  },
  "composition": {
    "layout": "hierarchical_top_down",
    "grouping_style": "rounded_containers_with_headers"
  },
  "diagram": {
    "title": {
      "text": "Your Agent Name",
      "subtitle": "Built with Google ADK"
    },
    "layers": [
      {
        "layer_id": "user_layer",
        "position": "top",
        "label": "User Interface",
        "components": [
          {"id": "user", "type": "actor", "label": "User", "icon": "person"},
          {"id": "ui", "type": "interface", "label": "ADK Web UI", "icon": "web"}
        ]
      },
      {
        "layer_id": "coordinator_layer",
        "position": "upper_middle",
        "label": "Coordinator",
        "components": [
          {
            "id": "root_agent",
            "type": "agent",
            "label": "Root Agent",
            "icon": "hub",
            "model": "gemini-3-pro-preview",
            "color": "#4285F4"
          }
        ]
      },
      {
        "layer_id": "sub_agents_layer",
        "position": "middle",
        "label": "Sub-Agents",
        "layout": "horizontal_row",
        "components": [
          {
            "id": "agent_1",
            "type": "agent_group",
            "label": "Agent 1",
            "color": "#34A853",
            "tools": [
              {"id": "tool_1", "label": "tool_name", "icon": "build"}
            ]
          },
          {
            "id": "agent_2",
            "type": "agent_group",
            "label": "Agent 2",
            "color": "#EA4335",
            "tools": []
          }
        ]
      },
      {
        "layer_id": "services_layer",
        "position": "lower_middle",
        "label": "External Services",
        "components": []
      },
      {
        "layer_id": "storage_layer",
        "position": "bottom",
        "label": "Storage",
        "components": []
      }
    ],
    "connections": [],
    "legend": {"show": true, "position": "bottom_right"}
  },
  "quality": {
    "detail_level": "high",
    "text_clarity": "maximum"
  }
}
```

### Template 2: Data Flow Diagram

For showing data movement through a system:

```json
{
  "metadata": {
    "title": "Data Flow Diagram",
    "output_format": "image/png"
  },
  "style": {
    "type": "flowchart",
    "aesthetic": "clean_minimal",
    "theme": "light_mode_clean",
    "color_palette": {
      "primary": "#2196F3",
      "secondary": "#4CAF50",
      "background": "#ffffff",
      "text_primary": "#212121"
    }
  },
  "composition": {
    "layout": "horizontal_flow",
    "flow_direction": "left_to_right"
  },
  "diagram": {
    "title": {"text": "Data Pipeline"},
    "layers": [
      {
        "layer_id": "flow",
        "layout": "horizontal_row",
        "components": [
          {"id": "source", "type": "database", "label": "Source", "icon": "input"},
          {"id": "process", "type": "process", "label": "Transform", "icon": "sync"},
          {"id": "destination", "type": "database", "label": "Destination", "icon": "output"}
        ]
      }
    ],
    "connections": [
      {"from": "source", "to": "process", "label": "Extract", "arrow": "single"},
      {"from": "process", "to": "destination", "label": "Load", "arrow": "single"}
    ]
  }
}
```

### Template 3: API Integration Diagram

For showing API connections:

```json
{
  "metadata": {
    "title": "API Integration Architecture"
  },
  "style": {
    "type": "network_diagram",
    "theme": "dark_mode_professional"
  },
  "composition": {
    "layout": "radial"
  },
  "diagram": {
    "title": {"text": "API Integrations"},
    "layers": [
      {
        "layer_id": "center",
        "components": [
          {"id": "app", "type": "agent", "label": "Your App", "icon": "hub", "size": "large"}
        ]
      },
      {
        "layer_id": "apis",
        "layout": "radial_around_center",
        "components": [
          {"id": "api_1", "type": "external_service", "label": "Gemini API", "icon": "cloud"},
          {"id": "api_2", "type": "external_service", "label": "Maps API", "icon": "map"},
          {"id": "api_3", "type": "external_service", "label": "Storage API", "icon": "cloud_upload"}
        ]
      }
    ],
    "connections": [
      {"from": "app", "to": "api_1", "type": "api_call", "arrow": "bidirectional"},
      {"from": "app", "to": "api_2", "type": "api_call", "arrow": "bidirectional"},
      {"from": "app", "to": "api_3", "type": "api_call", "arrow": "bidirectional"}
    ]
  }
}
```

### Template 4: Sequence/Workflow Diagram

For showing ordered steps:

```json
{
  "metadata": {
    "title": "Workflow Sequence"
  },
  "style": {
    "type": "sequence_diagram",
    "theme": "light_mode_clean"
  },
  "composition": {
    "layout": "vertical_flow",
    "flow_direction": "top_to_bottom"
  },
  "diagram": {
    "title": {"text": "Request Processing Flow"},
    "layers": [
      {
        "layer_id": "step_1",
        "position": "1",
        "components": [
          {"id": "step1", "type": "process", "label": "1. Receive Request", "icon": "input"}
        ]
      },
      {
        "layer_id": "step_2",
        "position": "2",
        "components": [
          {"id": "step2", "type": "process", "label": "2. Validate", "icon": "check"}
        ]
      },
      {
        "layer_id": "step_3",
        "position": "3",
        "components": [
          {"id": "step3", "type": "process", "label": "3. Process", "icon": "sync"}
        ]
      },
      {
        "layer_id": "step_4",
        "position": "4",
        "components": [
          {"id": "step4", "type": "process", "label": "4. Return Response", "icon": "output"}
        ]
      }
    ],
    "connections": [
      {"from": "step1", "to": "step2", "style": "solid", "arrow": "single"},
      {"from": "step2", "to": "step3", "style": "solid", "arrow": "single"},
      {"from": "step3", "to": "step4", "style": "solid", "arrow": "single"}
    ]
  }
}
```

---

## Best Practices

### 1. Structure First, Details Later

Start with the skeleton and add details:

```
1. Define layers (what groups exist)
2. Add components to each layer
3. Define connections between components
4. Add styling and annotations
5. Fine-tune colors and spacing
```

### 2. Use Consistent Color Coding

Assign colors by function:

| Function | Suggested Color |
|----------|----------------|
| Primary/Coordinator | Blue `#4285F4` |
| Success/Data | Green `#34A853` |
| Warning/Media | Yellow `#FBBC04` |
| Error/Critical | Red `#EA4335` |
| Neutral/Storage | Gray `#6c7b95` |
| External/API | Purple `#9c27b0` |

### 3. Limit Complexity Per Layer

- **Max 5-7 components per layer** for readability
- Use sub-grouping for more components
- Break into multiple diagrams if needed

### 4. Label All Connections

Every connection should have:
- Clear direction (arrows)
- Brief label describing the flow
- Consistent styling for similar types

### 5. Include Context

Always add:
- Title and subtitle
- Legend for symbols
- Annotations for key information
- Tech stack badges if relevant

### 6. Token Optimization

Nano Banana Pro has token limits:
- Minimize redundancy
- Use references for repeated patterns
- Compress nested arrays where possible

### 7. Iterative Refinement

JSON prompts support conversational refinement:

```
Turn 1: Generate base diagram
Turn 2: "Make the agent boxes larger"
Turn 3: "Add a connection from X to Y"
Turn 4: "Change the background to light mode"
```

---

## Examples

### Example 1: Simple Agent Architecture

```json
{
  "style": {"type": "technical_diagram", "theme": "dark_mode_professional"},
  "diagram": {
    "title": {"text": "Simple Agent"},
    "layers": [
      {
        "layer_id": "main",
        "components": [
          {"id": "user", "type": "actor", "label": "User"},
          {"id": "agent", "type": "agent", "label": "AI Agent", "model": "gemini-3-pro"},
          {"id": "tool", "type": "external_service", "label": "Tool"}
        ]
      }
    ],
    "connections": [
      {"from": "user", "to": "agent", "label": "Request"},
      {"from": "agent", "to": "tool", "label": "Execute"},
      {"from": "tool", "to": "agent", "label": "Result"}
    ]
  }
}
```

### Example 2: Database Schema Visualization

```json
{
  "style": {"type": "entity_relationship", "theme": "light_mode_clean"},
  "diagram": {
    "title": {"text": "Database Schema"},
    "layers": [
      {
        "layer_id": "tables",
        "layout": "grid_2x2",
        "components": [
          {
            "id": "users",
            "type": "database",
            "label": "users",
            "tables": [
              {"name": "id", "type": "PK"},
              {"name": "name", "type": "VARCHAR"},
              {"name": "email", "type": "VARCHAR"}
            ]
          },
          {
            "id": "orders",
            "type": "database",
            "label": "orders",
            "tables": [
              {"name": "id", "type": "PK"},
              {"name": "user_id", "type": "FK"},
              {"name": "total", "type": "DECIMAL"}
            ]
          }
        ]
      }
    ],
    "connections": [
      {"from": "users", "to": "orders", "label": "1:N", "style": "solid"}
    ]
  }
}
```

---

## References

- [Mindbees JSON Prompting Guide](https://www.mindbees.com/blog/json-prompts-gemini-nano-banana-guide-2025/)
- [Atlabs AI Nano Banana Pro Guide](https://www.atlabs.ai/blog/nano-banana-pro-json-prompting-guide-master-structured-ai-image-generation)
- [Higgsfield AI Expert Use Cases](https://higgsfield.ai/blog/Nano-Banana-Pro-Expert-Use-Cases)
- [Google AI Gemini Image Generation](https://ai.google.dev/gemini-api/docs/image-generation)
- [GitHub: awesome-nanobanana-pro](https://github.com/ZeroLu/awesome-nanobanana-pro)

---

## Quick Reference Card

```
JSON Skeleton:
├── metadata (version, title, author)
├── style (type, theme, colors)
├── technical (resolution, aspect_ratio)
├── composition (layout, spacing)
├── diagram
│   ├── title
│   ├── layers[] → components[]
│   ├── connections[]
│   ├── annotations[]
│   └── legend
└── quality (detail_level, text_clarity)

Component Types:
  actor | agent | agent_group | external_service |
  database | file_storage | interface | process

Connection Types:
  interaction | request | delegation | data_access |
  api_call | file_io | artifact_save | event | display

Line Styles:
  solid (primary) | dashed (secondary) | dotted (async)

Arrows:
  single | bidirectional | none
```
